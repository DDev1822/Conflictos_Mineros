"""Extract Reporte de Conflictos Sociales 268 for reviewed mining selection.

This reproducibility helper reads the official PDF from
tmp/pdfs/defensoria-reporte-conflictos-268.pdf and writes the complete
intermediate registry to tmp/conflicts-268-extracted.json. It does not publish
the general social-conflict registry. Only a separately reviewed mining subset
may be incorporated into canonical project data.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from dataclasses import asdict
from pathlib import Path
from typing import Iterable

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = ROOT / "tmp/pdfs/defensoria-reporte-conflictos-268.pdf"
OUTPUT_PATH = ROOT / "tmp/conflicts-268-extracted.json"
MINING_OUTPUT_PATH = ROOT / "tmp/mining-conflicts-268-reviewed.json"
CANONICAL_CASES_PATH = ROOT / "content/data/socialConflictCases.yaml"

REVIEWED_MINING_CASE_IDS = {
    "rcs-268-004", "rcs-268-005", "rcs-268-006", "rcs-268-008",
    "rcs-268-009", "rcs-268-010", "rcs-268-012", "rcs-268-015",
    "rcs-268-016", "rcs-268-017", "rcs-268-018", "rcs-268-019",
    "rcs-268-020", "rcs-268-021", "rcs-268-022", "rcs-268-027",
    "rcs-268-035", "rcs-268-037", "rcs-268-044", "rcs-268-045",
    "rcs-268-046", "rcs-268-052", "rcs-268-053", "rcs-268-054",
    "rcs-268-055", "rcs-268-056", "rcs-268-059", "rcs-268-060",
    "rcs-268-061", "rcs-268-062", "rcs-268-071", "rcs-268-072",
    "rcs-268-073", "rcs-268-074", "rcs-268-077", "rcs-268-079",
    "rcs-268-085", "rcs-268-093", "rcs-268-095", "rcs-268-099",
    "rcs-268-100", "rcs-268-101", "rcs-268-102", "rcs-268-103",
    "rcs-268-106", "rcs-268-112", "rcs-268-117", "rcs-268-119",
    "rcs-268-143", "rcs-268-146", "rcs-268-153", "rcs-268-155",
    "rcs-268-161", "rcs-268-162", "rcs-268-163", "rcs-268-167",
    "rcs-268-179", "rcs-268-180", "rcs-268-182", "rcs-268-183",
    "rcs-268-192",
}

REGION_IDS = {
    "Ancash": "ancash", "Apurimac": "apurimac", "Arequipa": "arequipa",
    "Ayacucho": "ayacucho", "Cajamarca": "cajamarca", "Cusco": "cusco",
    "Huancavelica": "huancavelica", "Huanuco": "huanuco", "Ica": "ica",
    "Junin": "junin", "La Libertad": "la-libertad", "Lambayeque": "lambayeque",
    "Lima Metropolitana": "lima-metropolitana", "Lima Provincias": "lima-provincias",
    "Loreto": "loreto", "Madre de Dios": "madre-de-dios", "Moquegua": "moquegua",
    "Pasco": "pasco", "Piura": "piura", "Puno": "puno", "San Martin": "san-martin",
    "Tacna": "tacna", "Tumbes": "tumbes", "Ucayali": "ucayali",
    "Amazonas": "amazonas", "Multirregional": "multiregional", "Nacional": "nacional",
}

REGION_OVERRIDES = {
    "rcs-268-035": "lima-provincias",
    "rcs-268-052": "puno",
    "rcs-268-053": "puno",
    "rcs-268-054": "puno",
    "rcs-268-059": "puno",
}

BASE_SPEC = importlib.util.spec_from_file_location(
    "extract_conflicts_266",
    ROOT / "scripts/extract-conflicts-266.py",
)
if BASE_SPEC is None or BASE_SPEC.loader is None:
    raise RuntimeError("No se pudo cargar el extractor base del reporte 266")
base = importlib.util.module_from_spec(BASE_SPEC)
sys.modules[BASE_SPEC.name] = base
BASE_SPEC.loader.exec_module(base)


def value_at(row: list[str | None], indexes: Iterable[int]) -> str:
    return base.clean(" ".join((row[index] or "") for index in indexes if index < len(row)))


def extract_tabular_cases(pdf: pdfplumber.PDF) -> list[base.Conflict]:
    cases: list[base.Conflict] = []

    def parse_tables(
        table_specs: list[tuple[int, int]],
        status: str,
    ) -> None:
        pending: dict[str, str] = {}

        def emit(source_page: int) -> None:
            nonlocal pending
            if not {"date", "region", "title", "type"}.issubset(pending):
                return
            month, year = pending["date"].split("/")
            cases.append(base.Conflict(
                title=base.clean(pending["title"]),
                status=status,
                conflict_type=base.canonical_type(pending["type"]),
                regions=[base.canonical_region(pending["region"])],
                start_period=f"{year}-{month}",
                source_page=source_page,
                has_monthly_events=False,
                title_method="report-denomination",
            ))
            pending = {}

        for page_number, table_index in table_specs:
            table = pdf.pages[page_number - 1].extract_tables()[table_index]
            for row in table:
                cells = [base.clean(cell or "") for cell in row]
                date = next((cell for cell in cells if re.fullmatch(r"\d{2}/\d{4}", cell)), "")
                raw_region = next((cell for cell in cells if base.canonical_region(cell) in base.REGIONS), "")
                region = base.canonical_region(raw_region) if raw_region else ""
                raw_type = cells[-1] if cells else ""
                conflict_type = base.canonical_type(raw_type) if raw_type and base.canonical_type(raw_type) in base.TYPES else ""

                if date:
                    emit(page_number)
                    pending["date"] = date
                if region:
                    pending["region"] = region
                if conflict_type:
                    pending["type"] = conflict_type

                ignored = {
                    "", date, raw_region, region, raw_type, conflict_type, "N.°", "Fecha de inicio",
                    "Departamento", "Denominación del caso", "Tipo",
                }
                title_parts = [
                    cell for cell in cells
                    if cell not in ignored
                    and not re.fullmatch(r"\d+\.", cell)
                ]
                if title_parts:
                    title_fragment = base.clean(" ".join(title_parts))
                    current_title = pending.get("title", "")
                    if title_fragment and base.canonical(title_fragment) not in base.canonical(current_title):
                        pending["title"] = base.clean(f"{current_title} {title_fragment}")
            emit(page_number)

    parse_tables([(91, 1), (92, 0), (93, 0)], "active")
    parse_tables([(93, 1), (94, 0)], "latent")
    return cases


def extract_detailed_cases(pdf: pdfplumber.PDF) -> list[base.Conflict]:
    chunks: list[str] = []
    for page_number in range(48, 92):
        words = [
            word for word in pdf.pages[page_number - 1].extract_words(x_tolerance=2, y_tolerance=3)
            if word["x0"] < 316 and 50 <= word["top"] <= 805
        ]
        lines: list[list[object]] = []
        for word in sorted(words, key=lambda item: (item["top"], item["x0"])):
            if not lines or abs(float(lines[-1][0]) - float(word["top"])) > 2:
                lines.append([word["top"], word["text"]])
            else:
                lines[-1][1] = f"{lines[-1][1]} {word['text']}"
        text = "\n".join(
            str(line[1]) for line in lines
            if "ADJUNTÍA" not in str(line[1])
            and "PREVENCIÓN DE CONFLICTOS SOCIALES" not in str(line[1])
        )
        text = re.sub(r"Reporte Mensual de Conflictos Sociales[^\n]+", "", text)
        chunks.append(f"\n[[PAGE:{page_number}]]\n{text}")

    combined = "\n".join(chunks)
    starts = list(re.finditer(r"(?m)^\s*Tipo:\s*([^\n]+)", combined))
    cases: list[base.Conflict] = []
    for index, match in enumerate(starts):
        body = combined[match.start(): starts[index + 1].start() if index + 1 < len(starts) else len(combined)]
        page_number = int(re.findall(r"\[\[PAGE:(\d+)\]\]", combined[:match.start()])[-1])
        body = re.sub(r"\[\[PAGE:\d+\]\]", " ", body)
        conflict_type = base.canonical_type(match.group(1).split(".")[0])
        date_match = re.search(r"Ingresó como caso nuevo:\s*([A-Za-záéíóúñ]+)\s+de\s+(\d{4})", body, re.I)
        start_period = None
        if date_match:
            start_period = f"{date_match.group(2)}-{base.MONTHS.get(base.canonical(date_match.group(1)), '01')}"
        summary_match = re.search(r"Caso:\s*(.*?)(?=\s*Ubicación\s*:?)", body, re.S)
        location_match = re.search(r"Ubicación\s*:?\s*(.*?)(?=\s*Actores primarios\s*:?)", body, re.S)
        summary = base.clean(summary_match.group(1)) if summary_match else None
        location = base.clean(location_match.group(1)) if location_match else None

        if page_number >= 90:
            regions = ["Multirregional"]
        else:
            matched_regions = [
                region for region in base.REGIONS - {"Nacional", "Multirregional"}
                if base.canonical(region) in base.canonical(location or "")
            ]
            regions = matched_regions[:1] or ["Nacional"]

        source_text = summary or "Caso sin denominación uniforme en el reporte"
        protected = re.sub(
            r"\bS\.\s*A\.(?:\s*C\.)?",
            lambda abbreviation: abbreviation.group(0).replace(".", "§"),
            source_text,
            flags=re.I,
        )
        fallback = base.clean(re.split(r"(?<=[.!?…])\s+", protected, maxsplit=1)[0].replace("§", "."))
        if len(fallback) > 160:
            fallback = fallback[:157].rsplit(" ", 1)[0] + "…"
        cases.append(base.Conflict(
            title=fallback,
            status="active",
            conflict_type=conflict_type,
            regions=regions,
            start_period=start_period,
            source_page=page_number,
            has_monthly_events=True,
            title_method="editorial-summary",
            summary=summary,
            location=location,
        ))
    return cases


def canonical_mining_cases(cases: list[base.Conflict]) -> list[dict[str, object]]:
    selected = [
        (index, case) for index, case in enumerate(cases, 1)
        if f"rcs-268-{index:03d}" in REVIEWED_MINING_CASE_IDS
    ]
    selected_ids = {f"rcs-268-{index:03d}" for index, _ in selected}
    if selected_ids != REVIEWED_MINING_CASE_IDS:
        missing = sorted(REVIEWED_MINING_CASE_IDS - selected_ids)
        raise ValueError(f"La selección minera contiene IDs inexistentes: {missing}")
    active = sum(case.status == "active" for _, case in selected)
    latent = sum(case.status == "latent" for _, case in selected)
    if (len(selected), active, latent) != (61, 50, 11):
        raise ValueError(f"La selección minera no reconcilia: total={len(selected)}, activos={active}, latentes={latent}")

    result: list[dict[str, object]] = []
    for index, case in selected:
        case_id = f"rcs-268-{index:03d}"
        region_ids = [REGION_OVERRIDES.get(case_id, REGION_IDS[case.regions[0]])]
        item: dict[str, object] = {
            "id": case_id,
            "snapshotId": "defensoria-2026-06-mining",
            "title": case.title,
            "titleMethod": case.title_method,
            "status": case.status,
            "conflictType": case.conflict_type,
            "regionIds": region_ids,
            "sourcePage": case.source_page,
            "hasMonthlyEvents": case.has_monthly_events,
        }
        if case.start_period:
            item["startPeriod"] = case.start_period
        if case.summary:
            item["summary"] = case.summary
        if case.location:
            item["location"] = case.location
        result.append(item)
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-canonical", action="store_true")
    args = parser.parse_args()
    if not PDF_PATH.exists():
        raise SystemExit(f"Falta el PDF oficial: {PDF_PATH}")
    with pdfplumber.open(PDF_PATH) as pdf:
        detailed = extract_detailed_cases(pdf)
        tabular = extract_tabular_cases(pdf)
    cases = detailed + tabular
    payload = {
        "metadata": {
            "report": 268,
            "period": "2026-06",
            "detailed": len(detailed),
            "tabular": len(tabular),
            "total": len(cases),
            "publicationScope": "mining-subset-only",
            "registryNote": "La página 92 repite CC Mariscal Castilla - Minera Chaska II; la selección minera conserva una sola ocurrencia.",
        },
        "cases": [
            dict(id=f"rcs-268-{index:03d}", **asdict(case))
            for index, case in enumerate(cases, 1)
        ],
    }
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    mining_cases = canonical_mining_cases(cases)
    MINING_OUTPUT_PATH.write_text(json.dumps(mining_cases, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if args.write_canonical:
        existing = json.loads(CANONICAL_CASES_PATH.read_text(encoding="utf-8"))
        preserved = [item for item in existing if item.get("snapshotId") != "defensoria-2026-06-mining"]
        CANONICAL_CASES_PATH.write_text(
            json.dumps(preserved + mining_cases, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    print(json.dumps(payload["metadata"], ensure_ascii=False))
    print(f"Escribió intermedio no publicable: {OUTPUT_PATH}")
    print(f"Escribió selección minera revisada: {MINING_OUTPUT_PATH}")
    if args.write_canonical:
        print(f"Actualizó datos canónicos: {CANONICAL_CASES_PATH}")


if __name__ == "__main__":
    main()
