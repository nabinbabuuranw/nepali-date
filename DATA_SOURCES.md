# Calendar data sources

Bikram Sambat month lengths (29–32 days) are set by the Nepal Panchanga Nirnayak Samiti and cannot be computed with a simple formula, so every BS converter ships a lookup table.

The table in `src/nepali-date.js` (2000–2090 BS) was built on 2026-11-01 by comparing four independent open-source tables and taking the **majority value for every year**:

| # | Source | Range |
|---|---|---|
| 1 | Python package [`nepali-datetime`](https://pypi.org/project/nepali-datetime/) ([GitHub](https://github.com/amitgaru/nepali-datetime)) | 1975–2100 BS |
| 2 | npm [`nepali-date-converter`](https://www.npmjs.com/package/nepali-date-converter) ([GitHub](https://github.com/subeshb1/Nepali-Date)) | 2000–2090 BS |
| 3 | npm [`bikram-sambat`](https://www.npmjs.com/package/bikram-sambat) ([GitHub](https://github.com/medic/bikram-sambat)) | 1970–2100 BS |
| 4 | npm [`ad-bs-converter`](https://www.npmjs.com/package/ad-bs-converter) ([GitHub](https://github.com/techgaun/ad-bs-converter)) | 1978–2100 BS |

All four agree for every year 2000–2090 except:

| Year | Majority (used here) | Dissent |
|---|---|---|
| 2062 | 30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31 (3 sources) | `nepali-datetime`: 31, 31, 31, 32, … |
| 2081–2083 | `nepali-datetime`, `nepali-date-converter`, `bikram-sambat` agree | `ad-bs-converter` differs |
| 2087 | 31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30 (3 sources) | `nepali-datetime`: …, 30, 29, 30, 30, 30, 30 |

Sanity anchors checked against widely published Nepali New Year dates: 1 Baishakh 2080 = 14 Apr 2023, 2081 = 13 Apr 2024, 2082 = 14 Apr 2025, 2083 = 14 Apr 2026.

The raw tables are kept in `test/fixtures-sources.json`; the test suite fails if any year in our table is not backed by at least three of the four sources.

Future years are projections. If the official Patro for a year differs, please open an issue or PR with a link to the published calendar.
