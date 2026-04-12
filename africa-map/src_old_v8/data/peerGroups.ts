export interface PeerGroup {
  id: string;
  label: string;
  countries: string[];
  description: string;
}

export const PEER_GROUPS: PeerGroup[] = [
  {
    id: 'all',
    label: 'All Africa',
    countries: [], // empty = no filter
    description: 'All 54 African countries',
  },
  {
    id: 'ecowas',
    label: 'ECOWAS',
    countries: ['Benin', 'Burkina Faso', 'Cabo Verde', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Liberia', 'Mali', 'Mauritania', 'Niger', 'Nigeria', 'Senegal', 'Sierra Leone', 'Togo'],
    description: 'Economic Community of West African States',
  },
  {
    id: 'sadc',
    label: 'SADC',
    countries: ['Angola', 'Botswana', 'Comoros', 'DR Congo', 'Eswatini', 'Lesotho', 'Madagascar', 'Malawi', 'Mauritius', 'Mozambique', 'Namibia', 'Seychelles', 'South Africa', 'Tanzania', 'Zambia', 'Zimbabwe'],
    description: 'Southern African Development Community',
  },
  {
    id: 'eac',
    label: 'EAC',
    countries: ['Burundi', 'DR Congo', 'Kenya', 'Rwanda', 'Somalia', 'South Sudan', 'Tanzania', 'Uganda'],
    description: 'East African Community',
  },
  {
    id: 'amu',
    label: 'AMU / North Africa',
    countries: ['Algeria', 'Egypt', 'Libya', 'Mauritania', 'Morocco', 'Tunisia'],
    description: 'Arab Maghreb Union + Egypt',
  },
  {
    id: 'eccas',
    label: 'ECCAS',
    countries: ['Angola', 'Burundi', 'Cameroon', 'Central African Republic', 'Chad', 'DR Congo', 'Equatorial Guinea', 'Gabon', 'Republic of Congo', 'Rwanda', 'São Tomé & Príncipe'],
    description: 'Economic Community of Central African States',
  },
  {
    id: 'oil',
    label: 'Oil Exporters',
    countries: ['Algeria', 'Angola', 'Cameroon', 'Chad', 'Republic of Congo', 'Equatorial Guinea', 'Gabon', 'Libya', 'Nigeria', 'South Sudan', 'Sudan'],
    description: 'Significant oil-exporting economies',
  },
  {
    id: 'frontier',
    label: 'Frontier Markets',
    countries: ['Botswana', 'Cabo Verde', 'Egypt', 'Ghana', 'Ivory Coast', 'Kenya', 'Mauritius', 'Morocco', 'Namibia', 'Nigeria', 'Rwanda', 'Senegal', 'South Africa', 'Tanzania', 'Tunisia', 'Uganda', 'Zambia'],
    description: 'Countries with recognised frontier market exchanges or capital markets',
  },
  {
    id: 'reformers',
    label: 'Reform Momentum',
    countries: ['Botswana', 'Cabo Verde', 'Ghana', 'Ivory Coast', 'Kenya', 'Mauritius', 'Morocco', 'Rwanda', 'Senegal', 'Seychelles', 'Tanzania', 'Tunisia'],
    description: 'Countries with positive reform trajectory in recent years',
  },
  {
    id: 'francophone',
    label: 'Francophone West Africa',
    countries: ['Benin', 'Burkina Faso', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Mali', 'Mauritania', 'Niger', 'Senegal', 'Togo'],
    description: 'Francophone West African states (UEMOA/ECOWAS)',
  },
];
