import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, ZoomControl, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { LatLngExpression, LatLngLiteral } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

// Fix Leaflet's default icon URLs when bundled
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

type LocationResponse = {
  country: string | null
  iso: string | null
  corporate_tax: string | null
  vat: string | null
  population_2024: string | null
  dividend_tax_resident: string | null
  dividend_tax_nonresident: string | null
  population_change: string | null
  democracy_pct: string | null
  economic_community: string | null
  legal_system: string | null
  political_stability: string | null
  contract_enforcement: string | null
  next_election: string | null
  corruption: string | null
  human_rights: string | null
  land_ownership: string | null
  land_licensing: string | null
  insurgency: string | null
  crime_composite: string | null
  region_name: string | null
  sez_present: string | null
  sez_name: string | null
  sez_vat_treatment: string | null
  sez_cit_rate: string | null
  land_ownership_rules: string | null
}

type PanelStatus = 'idle' | 'loading' | 'success' | 'nodata'

type NominatimAddress = {
  country_code?: string
  state?: string
  region?: string
  county?: string
}

type NominatimResponse = {
  address: NominatimAddress
}

type CsvRow = Record<string, string>

type MapClickHandlerProps = {
  onClick: (position: LatLngLiteral) => void
}

function MapClickHandler({ onClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onClick(e.latlng)
    },
  })

  return null
}

function getPopChangeClass(value: string | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (trimmed.startsWith('+')) return 'pop-positive'
  if (trimmed.startsWith('-')) return 'pop-negative'
  return undefined
}

function popChange(value: string | null): string {
  return value ?? '—'
}

function parseCsv(content: string): CsvRow[] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i]
    const next = content[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(field)
      field = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1
      row.push(field)
      field = ''
      if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
        rows.push(row)
      }
      row = []
      continue
    }

    field += char
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  if (rows.length === 0) return []

  const headers = rows[0]
  return rows.slice(1).map((cells) => {
    const record: CsvRow = {}
    headers.forEach((header, idx) => {
      record[header] = cells[idx] ?? ''
    })
    return record
  })
}

function getCsvValue(row: CsvRow | null, key: string): string | null {
  if (!row) return null
  const raw = row[key]
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  return trimmed ? trimmed : null
}

const App: React.FC = () => {
  const [markerPosition, setMarkerPosition] = useState<LatLngExpression | null>(
    null,
  )
  const [panelStatus, setPanelStatus] = useState<PanelStatus>('idle')
  const [data, setData] = useState<LocationResponse | null>(null)
  const requestIdRef = useRef(0)
  const [expanded, setExpanded] = useState(false)
  const [nationalProfileOpen, setNationalProfileOpen] = useState(false)
  const [nationalRows, setNationalRows] = useState<CsvRow[] | null>(null)
  const [subnationalRows, setSubnationalRows] = useState<CsvRow[] | null>(null)

  useEffect(() => {
    const loadCsvData = async () => {
      try {
        const nationalRes = await fetch(
          `${import.meta.env.BASE_URL}data/national_data.csv`,
        )
        const subnationalRes = await fetch(
          `${import.meta.env.BASE_URL}data/subnational_data.csv`,
        )

        if (!nationalRes.ok || !subnationalRes.ok) {
          return
        }

        const [nationalText, subnationalText] = await Promise.all([
          nationalRes.text(),
          subnationalRes.text(),
        ])

        setNationalRows(parseCsv(nationalText))
        setSubnationalRows(parseCsv(subnationalText))
      } catch {
        setNationalRows([])
        setSubnationalRows([])
      }
    }

    void loadCsvData()
  }, [])

  const handleMapClick = (position: LatLngLiteral) => {
    setMarkerPosition(position)
  }

  useEffect(() => {
    if (!markerPosition || !nationalRows || !subnationalRows) return

    const { lat, lng } = markerPosition as LatLngLiteral
    const currentRequestId = ++requestIdRef.current

    const run = async () => {
      setPanelStatus('loading')
      setData(null)

      try {
        const nominatimRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          {
            headers: { 'Accept-Language': 'en' },
          },
        )

        if (!nominatimRes.ok) {
          setPanelStatus('nodata')
          return
        }

        const nominatimJson = (await nominatimRes.json()) as NominatimResponse
        const iso = nominatimJson.address.country_code?.toUpperCase() ?? ''
        const region =
          nominatimJson.address.state ||
          nominatimJson.address.region ||
          nominatimJson.address.county ||
          ''

        if (!iso) {
          setPanelStatus('nodata')
          return
        }

        const targetIso = iso.trim().toLowerCase()
        const targetRegion = region.trim().toLowerCase()

        const nationalRow =
          nationalRows.find(
            (r) => (r['ISO'] || '').trim().toLowerCase() === targetIso,
          ) ?? null
        const subRow =
          targetRegion.length > 0
            ? subnationalRows.find((r) => {
                const rowIso = (r['ISO'] || '').trim().toLowerCase()
                const rowName = (r['Name'] || '').trim().toLowerCase()
                return rowIso === targetIso && rowName === targetRegion
              }) ?? null
            : null

        const frontendData: LocationResponse = {
          country: getCsvValue(nationalRow, 'Country'),
          iso: getCsvValue(nationalRow, 'ISO'),
          corporate_tax: getCsvValue(nationalRow, 'Corporate Tax'),
          vat: getCsvValue(nationalRow, 'VAT/Sales Tax'),
          dividend_tax_resident: getCsvValue(nationalRow, 'Res. Dividend Tax'),
          dividend_tax_nonresident: getCsvValue(
            nationalRow,
            'Non-Res. Dividend Tax',
          ),
          population_2024: getCsvValue(nationalRow, '2024 Population'),
          population_change: getCsvValue(nationalRow, '10yr Pop Change'),
          democracy_pct: getCsvValue(nationalRow, 'Democracy % (VDem Polyarchy)'),
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
          region_name: getCsvValue(subRow, 'Name'),
          sez_present: getCsvValue(subRow, 'SEZ Present'),
          sez_name: getCsvValue(subRow, 'SEZ Name'),
          sez_vat_treatment: getCsvValue(subRow, 'SEZ VAT Treatment'),
          sez_cit_rate: getCsvValue(subRow, 'SEZ CIT Rate'),
          land_ownership_rules: getCsvValue(subRow, 'Land Ownership Rules'),
        }

        if (!frontendData.country && !frontendData.region_name) {
          setPanelStatus('nodata')
          return
        }

        setData(frontendData)
        setPanelStatus('success')
      } catch {
        if (requestIdRef.current !== currentRequestId) {
          return
        }
        setPanelStatus('nodata')
      }
    }

    void run()
  }, [markerPosition, nationalRows, subnationalRows])

  const popChangeClass = getPopChangeClass(data?.population_change ?? null)

  return (
    <div className="app-root">
      <aside className={`panel${expanded ? ' panel-expanded' : ''}`}>
        {panelStatus === 'idle' && !markerPosition && (
          <div className="panel-muted">Click the map to explore</div>
        )}

        {panelStatus === 'loading' && (
          <div className="panel-loading">Loading...</div>
        )}

        {panelStatus === 'nodata' && <div>No data available</div>}

        {panelStatus === 'success' && data && (
          <div className="panel-content">
            {data.country && (
              <div className="panel-header">
                <img
                  src={`https://flagcdn.com/24x18/${(data?.iso ?? '').toLowerCase()}.png`}
                  alt={data?.country ?? ''}
                  style={{
                    width: '24px',
                    height: '18px',
                    borderRadius: '2px',
                    objectFit: 'cover',
                  }}
                />
                <span className="country-name">{data.country}</span>
              </div>
            )}

            <section className="section">
              <div className="section-label">National</div>

              <div className="data-row">
                <span className="data-label">Corporate Tax</span>
                <span className="data-value">
                  {data.corporate_tax ?? '—'}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">VAT</span>
                <span className="data-value">{data.vat ?? '—'}</span>
              </div>

              <div className="data-row">
                <span className="data-label">Pop. Change</span>
                <span
                  className={`data-value${
                    popChangeClass ? ` ${popChangeClass}` : ''
                  }`}
                >
                  {data.population_change ?? '—'}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">Democracy</span>
                <span className="data-value">
                  {data.democracy_pct ?? '—'}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">Economic Community</span>
                <span className="data-value">
                  {data.economic_community ?? '—'}
                </span>
              </div>

              {expanded && (
                <>
                  <div className="expanded-row">
                    <div className="expanded-label">Res. Dividend Tax</div>
                    <div className="expanded-value">
                      {data.dividend_tax_resident ?? '—'}
                    </div>
                  </div>

                  <div className="expanded-row">
                    <div className="expanded-label">Non-Res. Dividend Tax</div>
                    <div className="expanded-value">
                      {data.dividend_tax_nonresident ?? '—'}
                    </div>
                  </div>
                </>
              )}
            </section>

            {data.region_name && (
              <>
                <div className="sub-header">
                  <span className="region-name">{data.region_name}</span>
                  <span
                    className={`sez-badge${
                      data.sez_present === 'No' ? ' no' : ''
                    }`}
                  >
                    {data.sez_present === 'Yes'
                      ? 'SEZ: Yes'
                      : data.sez_present === 'No'
                        ? 'SEZ: No'
                        : 'SEZ —'}
                  </span>
                </div>

                {expanded && (
                  <section className="section">
                    <div className="section-label">Subnational</div>

                    <div className="expanded-row">
                      <div className="expanded-label">SEZ Name</div>
                      <div className="expanded-value">
                        {data.sez_name ?? '—'}
                      </div>
                    </div>

                    <div className="expanded-row">
                      <div className="expanded-label">SEZ VAT Treatment</div>
                      <div className="expanded-value">
                        {data.sez_vat_treatment ?? '—'}
                      </div>
                    </div>

                    <div className="expanded-row">
                      <div className="expanded-label">SEZ CIT Rate</div>
                      <div className="expanded-value">
                        {data.sez_cit_rate ?? '—'}
                      </div>
                    </div>

                    <div className="expanded-row">
                      <div className="expanded-label">Land Ownership</div>
                      <div className="expanded-value">
                        {data.land_ownership_rules ?? '—'}
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}

            <div className="panel-buttons">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setNationalProfileOpen(true)}
              >
                National Profile
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setExpanded((prev) => !prev)}
              >
                {expanded ? 'Show Less ▲' : 'Show More ▼'}
              </button>
            </div>
          </div>
        )}
      </aside>

      <main className="map-shell" aria-label="Africa map">
        <MapContainer
          center={[2, 20]}
          zoom={4}
          minZoom={3}
          maxBounds={[
            [-40, -25],
            [40, 55],
          ]}
          maxBoundsViscosity={1.0}
          zoomControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution="© OpenStreetMap contributors © CARTO"
          />

          <MapClickHandler onClick={handleMapClick} />

          <ZoomControl position="bottomleft" />

          {markerPosition && <Marker position={markerPosition} />}
        </MapContainer>
      </main>

      {nationalProfileOpen && data && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setNationalProfileOpen(false)}
        >
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {data.iso && (
                  <img
                    src={`https://flagcdn.com/24x18/${data.iso.toLowerCase()}.png`}
                    alt={data.country ?? ''}
                    style={{
                      width: '24px',
                      height: '18px',
                      borderRadius: '2px',
                      objectFit: 'cover',
                    }}
                  />
                )}
                <span className="country-name">{data.country ?? ''}</span>
              </div>
              <button
                type="button"
                className="modal-close"
                aria-label="Close"
                onClick={() => setNationalProfileOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="data-row">
                <span className="data-label">Corporate Tax</span>
                <span className="data-value">
                  {data.corporate_tax ?? '—'}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">VAT</span>
                <span className="data-value">{data.vat ?? '—'}</span>
              </div>

              <div className="data-row">
                <span className="data-label">Population (2024)</span>
                <span className="data-value">
                  {data.population_2024 ?? '—'}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">Pop. Change (10yr)</span>
                <span className="data-value">
                  {popChange(data.population_change)}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">Res. Dividend Tax</span>
                <span className="data-value">
                  {data.dividend_tax_resident ?? '—'}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">Non-Res. Dividend Tax</span>
                <span className="data-value">
                  {data.dividend_tax_nonresident ?? '—'}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">Democracy</span>
                <span className="data-value">
                  {data.democracy_pct ? `${data.democracy_pct}%` : '—'}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">Economic Community</span>
                <span className="data-value">
                  {data.economic_community ?? '—'}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">Legal System</span>
                <span className="data-value">
                  {data.legal_system ?? '—'}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">Political Stability</span>
                <span className="data-value">
                  {data.political_stability ?? '—'}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">Contract Enforcement</span>
                <span className="data-value">
                  {data.contract_enforcement ?? '—'}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">Next Election</span>
                <span className="data-value">{data.next_election ?? '—'}</span>
              </div>

              <div className="data-row">
                <span className="data-label">Corruption</span>
                <span className="data-value">{data.corruption ?? '—'}</span>
              </div>

              <div className="data-row">
                <span className="data-label">Human Rights</span>
                <span className="data-value">
                  {data.human_rights ?? '—'}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">Land Ownership</span>
                <span className="data-value">
                  {data.land_ownership ?? '—'}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">Land Licensing</span>
                <span className="data-value">
                  {data.land_licensing ?? '—'}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">Insurgency</span>
                <span className="data-value">{data.insurgency ?? '—'}</span>
              </div>

              <div className="data-row">
                <span className="data-label">Crime Composite</span>
                <span className="data-value">
                  {data.crime_composite ?? '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

