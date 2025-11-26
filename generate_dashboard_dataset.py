import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List


def collect_json_files(root: Path) -> List[Path]:
    files = sorted(root.glob("*.json"))
    return files


def load_records(files: Iterable[Path]) -> List[Dict[str, Any]]:
    combined = []
    for file in files:
        with file.open(encoding="utf8") as handle:
            data = json.load(handle)
        competencia = data.get("competencia")
        for registro in data.get("registros", []):
            registro["competencia"] = competencia
            combined.append(registro)
    return combined


def aggregate(records: Iterable[Dict[str, Any]], key: str, label: str) -> Dict[str, Dict[str, Any]]:
    result: Dict[str, Dict[str, Any]] = {}
    for registro in records:
        valor = registro.get(key) or f"SEM {label.upper()}"
        bucket = result.setdefault(
            valor,
            {
                "chave": valor,
                "count": 0,
                "liquido": 0.0,
                "vantagem": 0.0,
                "desconto": 0.0,
                "funcionarios": [],
            },
        )
        bucket["count"] += 1
        bucket["liquido"] += registro.get("liquido", 0.0) or 0.0
        bucket["vantagem"] += registro.get("vantagem", 0.0) or 0.0
        bucket["desconto"] += registro.get("desconto", 0.0) or 0.0
        if len(bucket["funcionarios"]) < 5:
            bucket["funcionarios"].append(registro.get("nome", ""))
    return result


def aggregate_funcao_nivel(records: Iterable[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    result: Dict[str, Dict[str, Any]] = {}
    for registro in records:
        funcao = registro.get("funcao") or "NÃO INFORMADO"
        nivel = registro.get("nivel") or "NÃO INFORMADO"
        chave = f"{funcao}||{nivel}"
        bucket = result.setdefault(
            chave,
            {
                "funcao": funcao,
                "nivel": nivel,
                "count": 0,
                "liquido": 0.0,
                "vantagem": 0.0,
                "desconto": 0.0,
            },
        )
        bucket["count"] += 1
        bucket["liquido"] += registro.get("liquido", 0.0) or 0.0
        bucket["vantagem"] += registro.get("vantagem", 0.0) or 0.0
        bucket["desconto"] += registro.get("desconto", 0.0) or 0.0
    return result


def top_n(records: Iterable[Dict[str, Any]], key: str, n: int = 10) -> List[Dict[str, Any]]:
    sorted_records = sorted(records, key=lambda r: r.get(key, 0) or 0.0, reverse=True)
    tops = []
    for registro in sorted_records[:n]:
        tops.append(
            {
                "nome": registro.get("nome"),
                "cpf": registro.get("cpf"),
                "lotacao_normalizada": registro.get("lotacao_normalizada"),
                "vinculo": registro.get("vinculo"),
                "situacao": registro.get("situacao"),
                "competencia": registro.get("competencia"),
                key: registro.get(key, 0.0) or 0.0,
            }
        )
    return tops


def summarize_competencias(records: Iterable[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    summary: Dict[str, Dict[str, Any]] = {}
    for registro in records:
        comp = registro.get("competencia") or "0000-00"
        bucket = summary.setdefault(
            comp,
            {"competencia": comp, "count": 0, "liquido": 0.0, "vantagem": 0.0, "desconto": 0.0},
        )
        bucket["count"] += 1
        bucket["liquido"] += registro.get("liquido", 0.0) or 0.0
        bucket["vantagem"] += registro.get("vantagem", 0.0) or 0.0
        bucket["desconto"] += registro.get("desconto", 0.0) or 0.0
    return summary


def main() -> None:
    root = Path("converted")
    root.mkdir(exist_ok=True)

    json_files = collect_json_files(root)
    if not json_files:
        raise SystemExit("Nenhum JSON encontrado em 'converted/'. Gere antes com payroll_to_json.py")

    registros = load_records(json_files)
    competencias = summarize_competencias(registros)
    lotacoes = aggregate(registros, "lotacao_normalizada", "lotação")
    vinculos = aggregate(registros, "vinculo", "vínculo")
    situacoes = aggregate(registros, "situacao", "situação")
    funcao_nivel = aggregate_funcao_nivel(registros)
    top_liquido = top_n(registros, "liquido", n=20)
    top_desconto = top_n(registros, "desconto", n=20)

    payload = {
        "meta": {
            "gerado_em": datetime.utcnow().isoformat() + "Z",
            "arquivos_processados": [str(p.name) for p in json_files],
            "total_registros": len(registros),
        },
        "competencias": competencias,
        "lotacoes": lotacoes,
        "vinculos": vinculos,
        "situacoes": situacoes,
        "funcao_nivel": funcao_nivel,
        "top_salarios_liquido": top_liquido,
        "top_salarios_desconto": top_desconto,
    }

    target = root / "dashboard_data_summary.json"
    with target.open("w", encoding="utf8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)

    print(f"Resumo gerado em {target} com {len(registros)} registros processados.")


if __name__ == "__main__":
    main()

