import argparse
import csv
import json
import re
import unicodedata
from pathlib import Path


def normalize_text(value: str) -> str:
    if value is None:
        return ""
    # Replace non-breaking spaces, then collapse whitespace
    cleaned = value.replace("\xa0", " ")
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip()


def remove_accents(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value)
    return "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")


def parse_monetary(value: str, linha: int, field: str, erros: list) -> float:
    cleaned = normalize_text(value)
    if cleaned in ("", "-"):
        return 0.0
    standardized = cleaned.replace(".", "").replace(",", ".")
    try:
        return float(standardized)
    except ValueError:
        erros.append(f"Linha {linha}: valor inválido em {field} ({value})")
        return 0.0


def normalize_cpf(value: str) -> str:
    digits = re.sub(r"\D", "", value or "")
    return digits.zfill(len(digits)) if digits else ""


def normalize_vinculo(value: str) -> str:
    text = normalize_text(value)
    text = remove_accents(text).upper()
    return text


def normalize_field(value: str) -> str:
    return normalize_text(value)


LOTACAO_PATTERNS = [
    (re.compile(r"(PORTUGAL\s+RAMALHO|PORTUGAL\s+RA)", re.I), "PORTUGAL RAMALHO"),
    (re.compile(r"(DR\s+HELVIO|HELVIO)", re.I), "HELVIO AUTO"),
    (re.compile(r"(UNCISAL)", re.I), "UNCISAL ADMINISTRATIVO"),
    (re.compile(r"(HOSPITAL\s+ESCOLA|HOSP\s+ESC|HOSPITALF)", re.I), "HOSPITAL ESCOLA"),
    (re.compile(r"(MATERNIDADE)", re.I), "MATERNIDADE"),
    (re.compile(r"(REITORIA)", re.I), "REITORIA"),
    (re.compile(r"(CENTRO\s+DE\s+CIENCIAS\s+INTEGRADORAS)", re.I), "CENTRO DE CIENCIAS INTEGRADORAS"),
    (re.compile(r"(CENTRO\s+DE\s+CIENCIAS\s+DA\s+SAUDE)", re.I), "CENTRO DE CIENCIAS DA SAUDE"),
    (re.compile(r"(CENTRO\s+DE\s+BIOLOGIA|CENTRO\s+DE\s+TECNOLOGIA)", re.I), "CENTRO DE TECNOLOGIA"),
    (re.compile(r"(PRO-REITORIA|PRO\s*REITORIA)", re.I), "PRO-REITORIA"),
]


STOPWORDS = {"DE", "DA", "DO", "DOS", "DAS", "E", "EM", "A", "O", "POR", "PARA", "COM", "NO", "NA"}


def normalize_lotacao(value: str) -> str:
    text = normalize_text(value).upper()
    if not text:
        return ""
    for pattern, normalized in LOTACAO_PATTERNS:
        if pattern.search(text):
            return normalized
    tokens = []
    for token in text.split():
        if token in STOPWORDS or re.fullmatch(r"[0-9]+", token):
            continue
        tokens.append(token)
    if not tokens:
        return text
    keywords = ["HOSP", "HOSPITAL", "DR", "UNIDADE", "DEPARTAMENTO", "CENTRO", "MATERN", "AMBULATORIO", "SERVICO"]
    for idx, token in enumerate(tokens):
        if any(keyword in token for keyword in keywords):
            candidate = " ".join(tokens[idx : idx + 3])
            return candidate.strip()
    if len(tokens) >= 2:
        return " ".join(tokens[-2:])
    return tokens[0]


def detect_competencia(lines: list[str]) -> str:
    for line in lines[:10]:
        match = re.search(r"(\d{2})/(\d{4})", line)
        if match:
            mes, ano = match.groups()
            return f"{ano}-{mes}"
    return "0000-00"


def parse_csv(path: Path, erros: list) -> list[dict]:
    with path.open("r", encoding="latin1", newline="") as handle:
        reader = csv.reader(handle, delimiter=";")
        rows = list(reader)
    header_idx = next((idx for idx, row in enumerate(rows) if row and row[0].strip().upper() == "NOME"), None)
    if header_idx is None:
        raise ValueError(f"Cabeçalho não encontrado em {path}")
    header = [remove_accents(normalize_text(col)).strip() for col in rows[header_idx]]
    data_rows = rows[header_idx + 1 :]

    registros = []
    for linha, row in enumerate(data_rows, start=header_idx + 2):
        if not any(cell.strip() for cell in row):
            continue
        columns = dict(zip(header, row + [""] * (len(header) - len(row))))
        nome = normalize_field(columns.get("Nome", ""))
        cpf = normalize_cpf(columns.get("CPF", ""))
        situacao = normalize_field(columns.get("Situacao", ""))
        motivo = normalize_field(columns.get("Motivo Afastamento", ""))
        vinculo = normalize_vinculo(columns.get("Vinculo", ""))
        matricula = normalize_field(columns.get("Matricula", ""))
        nivel = normalize_field(columns.get("Nivel", ""))
        lotacao_original = normalize_field(columns.get("Lotacao", ""))
        lotacao_normalizada = normalize_lotacao(lotacao_original)
        funcao = normalize_field(columns.get("Funcao", ""))
        vantagem = parse_monetary(columns.get("Vantagem", "0"), linha, "Vantagem", erros)
        desconto = parse_monetary(columns.get("Desconto", "0"), linha, "Desconto", erros)
        liquido = parse_monetary(columns.get("Liquido", "0"), linha, "Liquido", erros)

        registros.append(
            {
                "nome": nome,
                "cpf": cpf,
                "situacao": situacao,
                "motivo_afastamento": motivo,
                "vinculo": vinculo,
                "matricula": matricula,
                "nivel": nivel,
                "lotacao_original": lotacao_original,
                "lotacao_normalizada": lotacao_normalizada,
                "funcao": funcao,
                "vantagem": round(vantagem, 2),
                "desconto": round(desconto, 2),
                "liquido": round(liquido, 2),
            }
        )
    return registros


def main() -> None:
    parser = argparse.ArgumentParser(description="Converte relatórios gerenciais CSV em JSON normalizado")
    parser.add_argument("files", nargs="*", help="Caminhos para os arquivos CSV (omita para processar todos os *.csv no diretório atual)")
    parser.add_argument("--output-dir", default="converted", help="Diretório onde os JSONs serão escritos")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    if args.files:
        paths = [Path(arquivo) for arquivo in args.files]
    else:
        paths = sorted(Path(".").glob("*.csv"))

    for path in paths:
        if not path.exists():
            print(f"Ignorado {path}: arquivo não encontrado.")
            continue
        lines = path.read_text(encoding="latin1").splitlines()
        competencia = detect_competencia(lines)
        erros = []
        registros = parse_csv(path, erros)
        payload = {"competencia": competencia, "registros": registros, "erros": erros}
        target = output_dir / f"{competencia}_{path.stem}.json"
        with target.open("w", encoding="utf8") as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=2)
        print(f"{path.name} -> {target} ({len(registros)} registros, {len(erros)} erros)")


if __name__ == "__main__":
    main()

