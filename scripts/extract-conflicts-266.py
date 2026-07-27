"""Extract the conflict registry from Defensoria report 266.

This is a reproducibility helper, not part of the Next.js build. It expects the
official PDF in tmp/pdfs/defensoria-reporte-conflictos-266.pdf and writes an
intermediate JSON file to tmp/. Table titles are transcribed from the report;
detailed-case display titles are proposed from the official January 2026 map
only when there is a sufficiently strong match and must be reviewed before use.
"""

from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass, asdict
from difflib import SequenceMatcher
from pathlib import Path
from typing import Iterable

import pdfplumber
from lxml import etree


ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = ROOT / "tmp/pdfs/defensoria-reporte-conflictos-266.pdf"
KML_PATH = ROOT / "tmp/defensoria-conflictos-map.kml"
OUTPUT_PATH = ROOT / "tmp/conflicts-266-extracted.json"
YAML_OUTPUT_PATH = ROOT / "content/data/socialConflictCases.yaml"

TYPES = {
    "Socioambiental",
    "Asuntos de gobierno nacional",
    "Asuntos de gobierno regional",
    "Asuntos de gobierno local",
    "Comunal",
    "Demarcación territorial",
    "Otros asuntos",
    "Laboral",
}

REGIONS = {
    "Amazonas", "Ancash", "Apurimac", "Arequipa", "Ayacucho", "Cajamarca",
    "Cusco", "Huancavelica", "Huanuco", "Ica", "Junin", "La Libertad",
    "Lambayeque", "Lima Metropolitana", "Lima Provincias", "Loreto",
    "Madre de Dios", "Moquegua", "Pasco", "Piura", "Puno", "San Martin",
    "Tacna", "Tumbes", "Ucayali", "Multirregional", "Nacional",
}

MONTHS = {
    "enero": "01", "febrero": "02", "marzo": "03", "abril": "04",
    "mayo": "05", "junio": "06", "julio": "07", "agosto": "08",
    "septiembre": "09", "setiembre": "09", "octubre": "10",
    "noviembre": "11", "diciembre": "12",
}


def plain(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value or "")
    return "".join(char for char in normalized if not unicodedata.combining(char))


def clean(value: str) -> str:
    value = re.sub(r"\s+", " ", value or "").strip(" -–:\n")
    return value.replace("Multirre gional", "Multirregional")


def canonical(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", plain(clean(value)).lower()).strip()


def canonical_type(value: str) -> str:
    key = canonical(value)
    if not key:
        return ""
    key = key.replace("asunto de gobierno", "asuntos de gobierno")
    key = key.replace("asuntos del gobierno", "asuntos de gobierno")
    for item in TYPES:
        if canonical(item) in key or key in canonical(item):
            return item
    return clean(value).rstrip(".")


def canonical_region(value: str) -> str:
    key = canonical(value)
    for item in REGIONS:
        if canonical(item) == key:
            return item
    return clean(value)


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", canonical(value)).strip("-")


@dataclass
class Conflict:
    title: str
    status: str
    conflict_type: str
    regions: list[str]
    start_period: str | None
    source_page: int
    has_monthly_events: bool
    title_method: str
    summary: str | None = None
    location: str | None = None
    dialogue: str | None = None
    map_match: str | None = None
    map_match_score: float | None = None


def value_at(row: list[str | None], indexes: Iterable[int]) -> str:
    return clean(" ".join((row[index] or "") for index in indexes if index < len(row)))


def extract_table_cases(pdf: pdfplumber.PDF) -> list[Conflict]:
    cases: list[Conflict] = []
    pending: dict[str, str] = {}

    def emit(page_number: int) -> None:
        nonlocal pending
        required = {"date", "region", "title", "type"}
        if required.issubset(pending):
            date = pending["date"]
            # Preserve the report's apparent typo as a documented correction.
            if date == "10/20205":
                date = "10/2020"
            month, year = date.split("/")
            cases.append(Conflict(
                title=clean(pending["title"]),
                status="active",
                conflict_type=canonical_type(pending["type"]),
                regions=[canonical_region(pending["region"])],
                start_period=f"{year}-{month}",
                source_page=page_number,
                has_monthly_events=False,
                title_method="report-denomination",
            ))
            pending = {}

    for page_number in (72, 73, 74):
        tables = pdf.pages[page_number - 1].extract_tables()
        table = tables[1] if page_number == 72 else tables[0]
        if page_number in (72, 73):
            date_indexes, region_indexes, title_indexes, type_indexes = (0, 1, 2, 3), (3, 4, 5), (6, 7, 8), (9, 10, 11)
        else:
            date_indexes, region_indexes, title_indexes, type_indexes = (0, 1, 2), (3, 4), (5, 6, 7), (8, 9, 10)

        for row in table[3:]:
            date = value_at(row, date_indexes)
            region = value_at(row, region_indexes)
            title = value_at(row, title_indexes)
            conflict_type = value_at(row, type_indexes)

            if re.fullmatch(r"\d{2}/\d{4,5}", date):
                emit(page_number)
                pending["date"] = date
            if region and canonical_region(region) in REGIONS:
                pending["region"] = canonical_region(region)
            if title:
                pending["title"] = clean(f"{pending.get('title', '')} {title}")
            if conflict_type:
                pending["type"] = canonical_type(conflict_type)
            emit(page_number)

    emit(74)

    latent_table = pdf.pages[74].extract_tables()[0]
    latent_pending: dict[str, str] = {}

    def emit_latent() -> None:
        nonlocal latent_pending
        if not {"date", "region", "title", "type"}.issubset(latent_pending):
            return
        month, year = latent_pending["date"].split("/")
        cases.append(Conflict(
            title=clean(latent_pending["title"]), status="latent",
            conflict_type=canonical_type(latent_pending["type"]),
            regions=[canonical_region(latent_pending["region"])],
            start_period=f"{year}-{month}", source_page=75,
            has_monthly_events=False, title_method="report-denomination",
        ))
        latent_pending = {}

    for row in latent_table[3:]:
        date = value_at(row, (2, 3, 4, 5))
        region = value_at(row, (6, 7, 8, 9, 10))
        title = value_at(row, (11, 12, 13, 14, 15))
        conflict_type = value_at(row, (16, 17, 18, 19))
        if re.fullmatch(r"\d{2}/\d{4}", date):
            emit_latent()
            latent_pending["date"] = date
        if region: latent_pending["region"] = canonical_region(region)
        if title: latent_pending["title"] = clean(f"{latent_pending.get('title', '')} {title}")
        if conflict_type: latent_pending["type"] = canonical_type(conflict_type)
    emit_latent()
    return cases


def extract_map_cases() -> list[dict[str, str]]:
    if not KML_PATH.exists():
        return []
    tree = etree.parse(str(KML_PATH))
    ns = {"k": "http://www.opengis.net/kml/2.2"}
    folder = tree.xpath("//k:Folder", namespaces=ns)[0]
    records = []
    for placemark in folder.xpath("./k:Placemark", namespaces=ns):
        def field(name: str) -> str:
            values = placemark.xpath(
                f'./k:ExtendedData/k:Data[@name="{name}"]/k:value/text()', namespaces=ns,
            )
            return clean(values[0]) if values else ""
        records.append({
            "title": clean("".join(placemark.xpath("./k:name/text()", namespaces=ns))),
            "region": field("Dpto."), "scope": field("Multiregión o nacional"),
            "type": canonical_type(field("Tipo")), "status": canonical(field("Estado")),
            "province": field("Provincia"), "district": field("Distrito"),
            "company": field("Empresa involucrada"), "activity": field("Actividad"),
        })
    return records


def extract_detailed_cases(pdf: pdfplumber.PDF, map_cases: list[dict[str, str]]) -> list[Conflict]:
    chunks: list[str] = []
    for page_number in range(37, 72):
        page = pdf.pages[page_number - 1]
        # Rebuild the left column from complete words. Cropping clips words that
        # cross the column boundary and silently corrupts names and locations.
        words = [
            word for word in page.extract_words(x_tolerance=2, y_tolerance=3)
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
        text = re.sub(r"ADJUNTÍA PARA[^\n]+", "", text)
        chunks.append(f"\n[[PAGE:{page_number}]]\n{text}")
    combined = "\n".join(chunks)
    starts = list(re.finditer(r"(?m)^\s*Tipo:\s*([^\n]+)", combined))
    cases: list[Conflict] = []
    for index, match in enumerate(starts):
        body = combined[match.start(): starts[index + 1].start() if index + 1 < len(starts) else len(combined)]
        page_number = int(re.findall(r"\[\[PAGE:(\d+)\]\]", combined[:match.start()])[-1])
        body = re.sub(r"\[\[PAGE:\d+\]\]", " ", body)
        conflict_type = canonical_type(match.group(1).split(".")[0])
        date_match = re.search(r"Ingresó como caso nuevo:\s*([A-Za-záéíóúñ]+)\s+de\s+(\d{4})", body, re.I)
        start_period = None
        if date_match:
            start_period = f"{date_match.group(2)}-{MONTHS.get(canonical(date_match.group(1)), '01')}"
        summary_match = re.search(r"Caso:\s*(.*?)(?=\s*Ubicación\s*:?)", body, re.S)
        location_match = re.search(r"Ubicación\s*:?\s*(.*?)(?=\s*Actores primarios\s*:?)", body, re.S)
        summary = clean(summary_match.group(1)) if summary_match else None
        location = clean(location_match.group(1)) if location_match else None
        dialogue = "dialogue" if "HAY DIÁLOGO" in match.group(0) else "no-dialogue" if "NO HAY DIÁLOGO" in match.group(0) else None

        region_values: list[str] = []
        region_source = location or ""
        if "Nacional" in (location or "") and "departamento" not in (location or "").lower():
            region_values = ["Nacional"]
        elif page_number >= 71 and "Multirregional" in combined[max(0, match.start()-500):match.start()]:
            region_values = ["Multirregional"]
        else:
            for region in REGIONS - {"Nacional", "Multirregional"}:
                if canonical(region) in canonical(region_source):
                    region_values.append(region)
        if not region_values:
            region_values = ["Nacional"]

        candidates = []
        haystack = canonical(f"{summary or ''} {location or ''}")
        for record in map_cases:
            if record["status"] != "activo" or record["type"] != conflict_type:
                continue
            map_scope = record["scope"] or record["region"]
            if region_values[0] not in ("Nacional", "Multirregional") and canonical(region_values[0]) not in canonical(map_scope):
                continue
            title_tokens = {token for token in canonical(record["title"]).split() if len(token) > 3}
            overlap = sum(1 for token in title_tokens if token in haystack) / max(len(title_tokens), 1)
            context = canonical(f"{record['title']} {record['province']} {record['district']} {record['company']}")
            ratio = SequenceMatcher(None, context, haystack[: max(len(context) * 3, 100)]).ratio()
            score = round(overlap * 0.78 + ratio * 0.22, 3)
            candidates.append((score, record["title"]))
        candidates.sort(reverse=True)
        best_score, best_title = candidates[0] if candidates else (0.0, "")

        fallback = clean((summary or "Caso sin denominación uniforme en el reporte").split(".")[0])
        if len(fallback) > 160:
            fallback = fallback[:157].rsplit(" ", 1)[0] + "…"
        cases.append(Conflict(
            title=fallback,
            status="active", conflict_type=conflict_type, regions=region_values,
            start_period=start_period, source_page=page_number,
            has_monthly_events=True,
            title_method="editorial-summary",
            summary=summary, location=location, dialogue=dialogue,
            map_match=best_title or None, map_match_score=best_score or None,
        ))
    # The report's headings and location lines define these scopes. Keeping the
    # reviewed sequence explicit prevents place names mentioned in narratives
    # from being mistaken for the case's territorial classification.
    reviewed_regions = [
        "Ancash", "Ancash", "Ancash", "Apurimac", "Apurimac", "Apurimac", "Apurimac",
        "Arequipa", "Ayacucho", "Ayacucho", "Cajamarca", "Cusco", "Cusco", "Cusco",
        "Huancavelica", "Huanuco", "Huanuco", "Huanuco", "Ica",
        "Lima Provincias", "Lima Provincias", "Lima Provincias", "Lima Provincias", "Lima Provincias",
        "Loreto", "Loreto", "Loreto", "Loreto", "Loreto", "Loreto", "Loreto",
        "Madre de Dios", "Moquegua", "Moquegua", "Moquegua", "Pasco",
        "Piura", "Piura", "Piura", "Piura", "Piura", "Piura", "Piura",
        "Puno", "Puno", "Puno", "Puno", "Puno", "Puno", "Puno", "Puno", "Puno", "Puno", "Puno",
        "Ucayali", "Ucayali", "Ucayali", "Nacional", "Nacional", "Multirregional", "Multirregional",
    ]
    if len(cases) != len(reviewed_regions):
        raise ValueError(f"Expected {len(reviewed_regions)} detailed cases, found {len(cases)}")
    for case, region in zip(cases, reviewed_regions, strict=True):
        case.regions = [region]
    return cases


def main() -> None:
    if not PDF_PATH.exists():
        raise SystemExit(f"Missing official PDF: {PDF_PATH}")
    with pdfplumber.open(PDF_PATH) as pdf:
        table_cases = extract_table_cases(pdf)
        map_cases = extract_map_cases()
        detailed_cases = extract_detailed_cases(pdf, map_cases)
    # The Loreto row "Cinco cuencas - Lote 8 y 192" is also described among
    # cases with monthly events. Counting both rows yields 191 and is the only
    # territorial discrepancy against the report's aggregate tables (190 total,
    # 23 Loreto). Keep the detailed entry and exclude the repeated no-event row.
    repeated_title = "Cinco cuencas - Lote 8 y 192"
    repeated = [case for case in table_cases if case.status == "active" and case.title == repeated_title]
    if len(repeated) != 1:
        raise ValueError(f"Expected one repeated Loreto row, found {len(repeated)}")
    table_cases = [case for case in table_cases if case is not repeated[0]]
    all_cases = detailed_cases + table_cases
    payload = {
        "metadata": {
            "report": 266, "period": "2026-04", "map_reference_period": "2026-01",
            "detailed": len(detailed_cases), "tabular": len(table_cases), "total": len(all_cases),
            "excluded_repeated_row": repeated_title,
        },
        "cases": [dict(id=f"rcs-266-{index:03d}", **asdict(case)) for index, case in enumerate(all_cases, 1)],
    }
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    yaml_cases = []
    region_ids = {
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
    for index, case in enumerate(all_cases, 1):
        item = {
            "id": f"rcs-266-{index:03d}", "snapshotId": "defensoria-2026-04",
            "title": case.title, "titleMethod": case.title_method,
            "status": case.status, "conflictType": case.conflict_type,
            "regionIds": [region_ids[region] for region in case.regions],
            "sourcePage": case.source_page, "hasMonthlyEvents": case.has_monthly_events,
        }
        if case.start_period: item["startPeriod"] = case.start_period
        if case.summary: item["summary"] = case.summary
        if case.location: item["location"] = case.location
        yaml_cases.append(item)
    YAML_OUTPUT_PATH.write_text(
        # JSON is a strict subset of YAML; emitting it keeps this helper free of
        # an additional PyYAML dependency while remaining valid project data.
        json.dumps(yaml_cases, ensure_ascii=False, indent=2) + "\n", encoding="utf-8",
    )
    print(json.dumps(payload["metadata"], ensure_ascii=False))
    print(f"Wrote {OUTPUT_PATH}")
    print(f"Wrote {YAML_OUTPUT_PATH}")


if __name__ == "__main__":
    main()
