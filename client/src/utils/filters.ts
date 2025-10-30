export const filterableColumns = [
  { id: 'title', label: 'Název', type: 'string' },
  { id: 'genres', label: 'Žánry', type: 'string' },
  { id: 'release_date', label: 'Rok vydání', type: 'string' },
  { id: 'vote_average', label: 'Popularita', type: 'numeric' },
  { id: 'vote_count', label: 'Počet hlasů', type: 'numeric' },
  { id: 'runtime', label: 'Délka (min)', type: 'numeric' },
  { id: 'budget', label: 'Rozpočet', type: 'numeric' },
  { id: 'revenue', label: 'Tržby', type: 'numeric' },
];

export const operators = {
  string: [
    { id: 'contains', label: 'obsahuje' },
    { id: 'eq', label: 'je rovno' },
  ],
  numeric: [
    { id: 'gte', label: '>=' },
    { id: 'lte', label: '<=' },
    { id: 'eq', label: '==' },
    { id: 'gt', label: '>' },
    { id: 'lt', label: '<' },
  ],
};

export const getColumnType = (columnId: string): 'string' | 'numeric' => {
  return filterableColumns.find(c => c.id === columnId)?.type as 'string' | 'numeric';
}

export const getDefaultOperator = (columnId: string) => {
  const type = getColumnType(columnId);
  return operators[type][0].id;
}