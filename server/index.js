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

  const responseBody = {
    country: nationalRow?.['Country'] ?? null,
    iso: nationalRow?.['ISO'] ?? null,
    corporate_tax: nationalRow?.['Corporate Tax'] ?? null,
    vat: nationalRow?.['VAT/Sales Tax'] ?? null,
    dividend_tax_resident: nationalRow?.['Res. Dividend Tax'] ?? null,
    dividend_tax_nonresident: nationalRow?.['Non-Res. Dividend Tax'] ?? null,
    population_2024: nationalRow?.['2024 Population'] ?? null,
    population_change: nationalRow?.['10yr Pop Change'] ?? null,
    democracy_pct: nationalRow?.['Democracy % (VDem Polyarchy)'] ?? null,
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

