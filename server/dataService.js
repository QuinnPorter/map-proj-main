const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')

/** @type {Array<Record<string, string>>} */
let nationalRows = []

/** @type {Array<Record<string, string>>} */
let subnationalRows = []

function loadData() {
  try {
    const nationalPath = path.resolve(__dirname, '../national_data.csv')
    const subnationalPath = path.resolve(__dirname, '../subnational_data.csv')

    const nationalCsv = fs.readFileSync(nationalPath, 'utf8')
    const subnationalCsv = fs.readFileSync(subnationalPath, 'utf8')

    nationalRows = parse(nationalCsv, {
      columns: true,
      trim: true,
      skip_empty_lines: true,
    })

    subnationalRows = parse(subnationalCsv, {
      columns: true,
      trim: true,
      skip_empty_lines: true,
    })

    console.log(
      `Loaded ${nationalRows.length} national rows and ${subnationalRows.length} subnational rows.`,
    )
  } catch (err) {
    const message =
      err && typeof err === 'object' && 'message' in err
        ? /** @type {{ message?: string }} */ (err).message || String(err)
        : String(err)
    console.error('Failed to load CSV data:', message)
    process.exit(1)
  }
}

/**
 * @param {string} iso
 * @returns {Record<string, string> | null}
 */
function getNationalData(iso) {
  if (!iso) return null
  const targetIso = String(iso).trim().toLowerCase()

  const row = nationalRows.find((r) => {
    const value = (r['ISO'] || '').trim().toLowerCase()
    return value === targetIso
  })

  return row || null
}

/**
 * @param {string} iso
 * @param {string} region
 * @returns {Record<string, string> | null}
 */
function getSubnationalData(iso, region) {
  if (!iso || !region) return null

  const targetIso = String(iso).trim().toLowerCase()
  const targetRegion = String(region).trim().toLowerCase()

  const row = subnationalRows.find((r) => {
    const rowIso = (r['ISO'] || '').trim().toLowerCase()
    const rowName = (r['Name'] || '').trim().toLowerCase()
    return rowIso === targetIso && rowName === targetRegion
  })

  return row || null
}

module.exports = {
  loadData,
  getNationalData,
  getSubnationalData,
}

