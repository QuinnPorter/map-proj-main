const express = require('express')
const cors = require('cors')
const {
  loadData,
  getNationalData,
  getSubnationalData,
} = require('./dataService')

loadData()

const app = express()

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
  }),
)

app.use(express.json())

app.get('/api/location', (req, res) => {
  const { iso, region } = req.query

  if (typeof iso !== 'string' || !iso.trim()) {
    return res.status(400).json({ error: 'Missing iso parameter' })
  }

  const nationalRow = getNationalData(iso)
  const subRow =
    typeof region === 'string' && region.trim()
      ? getSubnationalData(iso, region)
      : null

  if (!nationalRow && !subRow) {
    return res
      .status(404)
      .json({ error: 'No data found for this location' })
  }

  const getCsvValue = (row, key) => {
    if (!row) return null
    const raw = row?.[key]
    if (typeof raw !== 'string') return null
    const trimmed = raw.trim()
    return trimmed ? trimmed : null
  }

  const responseBody = {
    country: getCsvValue(nationalRow, 'Country'),
    iso: getCsvValue(nationalRow, 'ISO'),
    corporate_tax: getCsvValue(nationalRow, 'Corporate Tax'),
    vat: getCsvValue(nationalRow, 'VAT/Sales Tax'),
    dividend_tax_resident: getCsvValue(
      nationalRow,
      'Res. Dividend Tax',
    ),
    dividend_tax_nonresident: getCsvValue(
      nationalRow,
      'Non-Res. Dividend Tax',
    ),
    population_2024: getCsvValue(nationalRow, '2024 Population'),
    population_change: getCsvValue(nationalRow, '10yr Pop Change'),
    democracy_pct: getCsvValue(
      nationalRow,
      'Democracy % (VDem Polyarchy)',
    ),
    economic_community: getCsvValue(nationalRow, 'Economic Community'),
    legal_system: getCsvValue(nationalRow, 'Legal System (desc)'),
    political_stability: getCsvValue(
      nationalRow,
      'Political Stability (desc)',
    ),
    contract_enforcement: getCsvValue(
      nationalRow,
      'Contract Enforcement (compact)',
    ),
    next_election: getCsvValue(nationalRow, 'Next Election'),
    corruption: getCsvValue(nationalRow, 'Corruption (desc)'),
    human_rights: getCsvValue(nationalRow, 'Human Rights (desc)'),
    land_ownership: getCsvValue(nationalRow, 'Land Ownership (desc)'),
    land_licensing: getCsvValue(nationalRow, 'Land Licensing (desc)'),
    insurgency: getCsvValue(nationalRow, 'Insurgency (compact)'),
    crime_composite: getCsvValue(nationalRow, 'Crime Composite (desc)'),
    region_name: subRow?.['Name'] ?? null,
    sez_present: subRow?.['SEZ Present'] ?? null,
    sez_name: subRow?.['SEZ Name'] ?? null,
    sez_vat_treatment: subRow?.['SEZ VAT Treatment'] ?? null,
    sez_cit_rate: subRow?.['SEZ CIT Rate'] ?? null,
    local_licensing_fee: subRow?.['Local Licensing Fee'] ?? null,
    land_ownership_rules: subRow?.['Land Ownership Rules'] ?? null,
  }

  return res.status(200).json(responseBody)
})

const PORT = 3001

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

