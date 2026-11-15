import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import * as XLSX from 'xlsx';
import { useQueryClient } from '@tanstack/react-query';
import { useCatalog } from '../../hooks/useCatalog';
import {
  recordImportLog,
  upsertPlayerEligibility,
  upsertPlayerFull,
  upsertPlayerStatistics,
} from '../../services/dataService';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { LoadingState, PageHeader } from '../../components/common/CommonUi';
import { AdminLayout } from './AdminLayout';
import type { ActualSquadStatus, PlayerRole } from '../../types/ipl';

type ImportType = 'players' | 'eligibility' | 'statistics';

const TARGET_FIELDS: Record<ImportType, string[]> = {
  players: [
    'name', 'shortName', 'dob', 'nationality', 'countryFlag', 'primaryRole',
    'battingStyle', 'bowlingStyle', 'isCapped', 'isWicketkeeper', 'isOverseas',
    'batting', 'powerHitting', 'technique', 'finishing', 'paceBowling',
    'spinBowling', 'wicketkeeping', 'fielding', 'overall',
  ],
  eligibility: ['playerId', 'seasonId', 'actualTeamId', 'isAvailable', 'actualSquadStatus'],
  statistics: ['playerId', 'seasonId', 'matches', 'runs', 'battingAverage', 'strikeRate', 'wickets', 'economy'],
};

interface ValidatedRow {
  rowIndex: number;
  data: Record<string, unknown>;
  valid: boolean;
  error?: string;
}

export function ImportsManagementPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const showSnackbar = useAppStore((s) => s.showSnackbar);
  const { catalog, isLoading } = useCatalog();

  const [importType, setImportType] = useState<ImportType>('players');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([]);
  const [importing, setImporting] = useState(false);

  if (isLoading || !catalog) return <AdminLayout><LoadingState count={3} /></AdminLayout>;

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([TARGET_FIELDS[importType]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, importType);
    XLSX.writeFile(wb, `squad25_${importType}_template.xlsx`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    if (json.length === 0) {
      showSnackbar('Uploaded file has no rows.', 'warning');
      return;
    }
    const cols = Object.keys(json[0]);
    setHeaders(cols);
    setRawRows(json);

    // Auto-map matching column names
    const autoMap: Record<string, string> = {};
    for (const target of TARGET_FIELDS[importType]) {
      const exact = cols.find((c) => c.toLowerCase() === target.toLowerCase());
      if (exact) autoMap[target] = exact;
    }
    setColumnMap(autoMap);
    validateMappedRows(json, autoMap, importType);
  };

  const validateMappedRows = (
    rows: Record<string, unknown>[],
    map: Record<string, string>,
    type: ImportType
  ) => {
    const seenKeys = new Set<string>();
    const results: ValidatedRow[] = rows.map((row, idx) => {
      const mapped: Record<string, unknown> = {};
      for (const target of TARGET_FIELDS[type]) {
        const srcCol = map[target];
        mapped[target] = srcCol ? row[srcCol] : '';
      }

      if (type === 'players') {
        const name = String(mapped.name || '').trim();
        const role = String(mapped.primaryRole || '').toUpperCase();
        if (!name) return { rowIndex: idx + 1, data: mapped, valid: false, error: 'Missing player name' };
        const missingFields = ['nationality', 'countryFlag', 'battingStyle']
          .filter((field) => !String(mapped[field] || '').trim());
        if (missingFields.length) {
          return {
            rowIndex: idx + 1,
            data: mapped,
            valid: false,
            error: `Missing required fields: ${missingFields.join(', ')}`,
          };
        }
        if (!['WK', 'BAT', 'AR', 'BOWL'].includes(role)) {
          return { rowIndex: idx + 1, data: mapped, valid: false, error: `Invalid role "${role}" (expected WK/BAT/AR/BOWL)` };
        }
        if (seenKeys.has(name.toLowerCase())) {
          return { rowIndex: idx + 1, data: mapped, valid: false, error: 'Duplicate player row in file' };
        }
        seenKeys.add(name.toLowerCase());
      } else if (type === 'eligibility') {
        const pid = String(mapped.playerId || '').trim();
        const sid = String(mapped.seasonId || '').trim();
        if (!pid || !sid) return { rowIndex: idx + 1, data: mapped, valid: false, error: 'playerId and seasonId required' };
        const key = `${pid}_${sid}`;
        if (seenKeys.has(key)) return { rowIndex: idx + 1, data: mapped, valid: false, error: 'Duplicate eligibility key' };
        seenKeys.add(key);
      } else if (type === 'statistics') {
        const pid = String(mapped.playerId || '').trim();
        if (!pid) return { rowIndex: idx + 1, data: mapped, valid: false, error: 'playerId required' };
      }

      return { rowIndex: idx + 1, data: mapped, valid: true };
    });
    setValidatedRows(results);
  };

  const handleCommitImport = async () => {
    const validOnes = validatedRows.filter((r) => r.valid);
    if (validOnes.length === 0) return;
    setImporting(true);
    try {
      for (const r of validOnes) {
        const d = r.data;
        if (importType === 'players') {
          const name = String(d.name).trim();
          const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          await upsertPlayerFull(
            {
              id,
              name,
              shortName: String(d.shortName || name),
              dob: String(d.dob ?? '').trim() || null,
              nationality: String(d.nationality),
              countryFlag: String(d.countryFlag).toUpperCase(),
              biography: '',
              primaryRole: String(d.primaryRole).toUpperCase() as PlayerRole,
              battingStyle: String(d.battingStyle),
              bowlingStyle: String(d.bowlingStyle ?? '').trim(),
              isCapped: Boolean(d.isCapped === true || String(d.isCapped).toLowerCase() === 'true'),
              isWicketkeeper: Boolean(d.isWicketkeeper === true || String(d.isWicketkeeper).toLowerCase() === 'true'),
              isOverseas: Boolean(d.isOverseas === true || String(d.isOverseas).toLowerCase() === 'true'),
            },
            {
              playerId: id,
              batting: Number(d.batting) || 0,
              powerHitting: Number(d.powerHitting) || 0,
              technique: Number(d.technique) || 0,
              finishing: Number(d.finishing) || 0,
              paceBowling: Number(d.paceBowling) || 0,
              spinBowling: Number(d.spinBowling) || 0,
              wicketkeeping: Number(d.wicketkeeping) || 0,
              fielding: Number(d.fielding) || 0,
              overall: Number(d.overall) || 0,
            }
          );
        } else if (importType === 'eligibility') {
          const pid = String(d.playerId).trim();
          const sid = String(d.seasonId).trim();
          const player = catalog.players.find((p) => p.id === pid);
          await upsertPlayerEligibility({
            id: `${pid}_${sid}`,
            playerId: pid,
            seasonId: sid,
            actualTeamId: String(d.actualTeamId || '') || null,
            isAvailable:
              String(d.isAvailable).trim() === ''
                ? true
                : d.isAvailable === true || String(d.isAvailable).toLowerCase() === 'true',
            actualSquadStatus: (String(d.actualSquadStatus || 'Active') as ActualSquadStatus),
            isOverseasSnapshot: player?.isOverseas ?? false,
          });
        } else if (importType === 'statistics') {
          const pid = String(d.playerId).trim();
          const sid = String(d.seasonId || 'career').trim();
          await upsertPlayerStatistics({
            id: `${pid}_${sid}`,
            playerId: pid,
            seasonId: sid,
            scope: sid === 'career' ? 'career' : 'season',
            matches: Number(d.matches) || 0,
            inningsBat: 0,
            runs: Number(d.runs) || 0,
            highestScore: '0',
            battingAverage: Number(d.battingAverage) || 0,
            strikeRate: Number(d.strikeRate) || 0,
            centuries: 0,
            halfCenturies: 0,
            fours: 0,
            sixes: 0,
            inningsBowl: 0,
            overs: 0,
            runsConceded: 0,
            wickets: Number(d.wickets) || 0,
            economy: Number(d.economy) || 0,
            bowlingAverage: 0,
            bowlingStrikeRate: 0,
            bestBowling: '0/0',
            fiveWicketHauls: 0,
            catches: 0,
            runOuts: 0,
            stumpings: 0,
          });
        }
      }

      await recordImportLog({
        id: `imp_${Date.now().toString(36)}`,
        type: importType,
        fileName,
        totalRows: validatedRows.length,
        importedRows: validOnes.length,
        failedRows: validatedRows.length - validOnes.length,
        importedBy: user?.uid || 'admin',
        createdAt: new Date().toISOString(),
      });

      await qc.invalidateQueries({ queryKey: ['catalog'] });
      await qc.invalidateQueries({ queryKey: ['import_logs'] });
      showSnackbar(`Imported ${validOnes.length} ${importType} records to Supabase!`, 'success');
    } finally {
      setImporting(false);
    }
  };

  const handleExportReport = () => {
    const report = validatedRows.map((r) => ({
      Row: r.rowIndex,
      Status: r.valid ? 'VALID' : 'FAILED',
      Error: r.error || '',
      ...r.data,
    }));
    const ws = XLSX.utils.json_to_sheet(report);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ImportReport');
    XLSX.writeFile(wb, `import_report_${Date.now()}.xlsx`);
  };

  const validCount = validatedRows.filter((r) => r.valid).length;
  const failedCount = validatedRows.length - validCount;

  return (
    <AdminLayout>
      <Stack spacing={2.5}>
        <PageHeader
          title="Excel & CSV Bulk Imports (SheetJS)"
          subtitle="Download templates, map columns, validate duplicates, import valid records, and export audit reports."
          actions={
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadTemplate}>
              Download {importType} Template
            </Button>
          }
        />

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Import Dataset</InputLabel>
                  <Select
                    label="Import Dataset"
                    value={importType}
                    onChange={(e) => {
                      setImportType(e.target.value as ImportType);
                      setValidatedRows([]);
                      setRawRows([]);
                    }}
                  >
                    <MenuItem value="players">Players Master</MenuItem>
                    <MenuItem value="eligibility">Season Eligibility</MenuItem>
                    <MenuItem value="statistics">Player Statistics</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Button variant="contained" component="label" startIcon={<UploadFileIcon />}>
                    Upload XLSX / CSV
                    <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                  </Button>
                  {fileName && <Typography variant="body2" color="text.secondary">{fileName}</Typography>}
                </Stack>
              </Grid>
            </Grid>

            {headers.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  Column Mapping
                </Typography>
                <Grid container spacing={1.5}>
                  {TARGET_FIELDS[importType].map((target) => (
                    <Grid key={target} size={{ xs: 6, sm: 4, md: 3 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{target}</InputLabel>
                        <Select
                          label={target}
                          value={columnMap[target] || ''}
                          onChange={(e) => {
                            const nextMap = { ...columnMap, [target]: e.target.value };
                            setColumnMap(nextMap);
                            validateMappedRows(rawRows, nextMap, importType);
                          }}
                        >
                          <MenuItem value="">-- Skip --</MenuItem>
                          {headers.map((h) => (
                            <MenuItem key={h} value={h}>{h}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>

        {validatedRows.length > 0 && (
          <Card>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
                <Stack direction="row" spacing={1}>
                  <Chip label={`Valid: ${validCount}`} color="success" />
                  <Chip label={`Failed: ${failedCount}`} color={failedCount > 0 ? 'error' : 'default'} />
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExportReport}>
                    Export Report
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    disabled={validCount === 0 || importing}
                    onClick={handleCommitImport}
                  >
                    {importing ? 'Importing...' : `Import ${validCount} Valid Rows`}
                  </Button>
                </Stack>
              </Stack>

              {failedCount > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {failedCount} row(s) failed validation and will be skipped during import.
                </Alert>
              )}

              <TableContainer sx={{ maxHeight: 360 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Row</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Preview</TableCell>
                      <TableCell>Validation Error</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {validatedRows.map((r) => (
                      <TableRow key={r.rowIndex}>
                        <TableCell>{r.rowIndex}</TableCell>
                        <TableCell>
                          <Chip size="small" label={r.valid ? 'VALID' : 'FAILED'} color={r.valid ? 'success' : 'error'} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" noWrap sx={{ maxWidth: 340, display: 'block' }}>
                            {JSON.stringify(r.data)}
                          </Typography>
                        </TableCell>
                        <TableCell color="error.main">{r.error || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Stack>
    </AdminLayout>
  );
}
