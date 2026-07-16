/* ════════════════════════════════════════════════════════════════════
   CACCO — Reports & Compliance
   Statutory reporting · audit trail · Ministry submissions
   ════════════════════════════════════════════════════════════════════ */
import React, { useState } from 'react';
import { Panel, MetricCard, Chip, PageHeader, KV, Dot, ActionModal } from '../components/ui';
import { Icon } from '../components/Icon';
import { clockDate } from '../utils/format';
import { useT } from '../contexts/LanguageContext';
const REPORTS = [
    { id: 'RPT-001', title: 'Daily Operations Summary', category: 'Operations', frequency: 'Daily', lastGenerated: 'Today 06:00', nextDue: 'Tomorrow 06:00', status: 'current', recipient: 'Director / Ministry' },
    { id: 'RPT-002', title: 'Incident Summary Report', category: 'Security', frequency: 'Daily', lastGenerated: 'Today 06:00', nextDue: 'Tomorrow 06:00', status: 'current', recipient: 'Director / MJSP' },
    { id: 'RPT-003', title: 'Population Census', category: 'Operations', frequency: 'Weekly', lastGenerated: '3 days ago', nextDue: 'In 4 days', status: 'current', recipient: 'Ministry of Justice' },
    { id: 'RPT-004', title: 'Intelligence Assessment', category: 'Intelligence', frequency: 'Weekly', lastGenerated: '5 days ago', nextDue: 'In 2 days', status: 'due', recipient: 'National Intelligence Directorate' },
    { id: 'RPT-005', title: 'Rehabilitation Programme Status', category: 'Rehabilitation', frequency: 'Monthly', lastGenerated: '18 days ago', nextDue: 'In 12 days', status: 'current', recipient: 'Ministry of Justice' },
    { id: 'RPT-006', title: 'Staff Deployment Audit', category: 'HR', frequency: 'Monthly', lastGenerated: '28 days ago', nextDue: 'In 2 days', status: 'due', recipient: 'HR Division / Ministry' },
    { id: 'RPT-007', title: 'Contraband Intercept Log', category: 'Security', frequency: 'Monthly', lastGenerated: '32 days ago', nextDue: 'Overdue by 2d', status: 'overdue', recipient: 'Director / OIJ' },
    { id: 'RPT-008', title: 'Human Rights Compliance Audit', category: 'Compliance', frequency: 'Quarterly', lastGenerated: '62 days ago', nextDue: 'In 28 days', status: 'current', recipient: 'IDHAB / Ministry' },
    { id: 'RPT-009', title: 'Behavioral Risk Assessment', category: 'Intelligence', frequency: 'Monthly', lastGenerated: '8 days ago', nextDue: 'In 22 days', status: 'current', recipient: 'NIS / OIJ / Director' },
    { id: 'RPT-010', title: 'Annual Facility Report', category: 'Governance', frequency: 'Annual', lastGenerated: '214 days ago', nextDue: 'In 151 days', status: 'current', recipient: 'Ministry of Justice and Peace' },
];
const AUDIT_COLOR = { info: '#38bdf8', warning: '#f59e0b', critical: '#ef4444' };
export default function Reports() {
    const { t } = useT();
    const STATUS_TONE = {
        current: { hex: '#10b981', chip: 'success', label: t('rpt.statusCurrent') },
        due: { hex: '#f59e0b', chip: 'warning', label: t('rpt.statusDueSoon') },
        overdue: { hex: '#ef4444', chip: 'danger', label: t('rpt.statusOverdue') },
    };
    const AUDIT = [
        { ts: '14:32:11', action: 'Report RPT-001 generated and transmitted', user: 'SYSTEM', ref: 'RPT-001', severity: 'info' },
        { ts: '13:58:44', action: 'Security Level changed from LEVEL 1 to LEVEL 2', user: 'Director Vargas', ref: 'SEC-EVT-4492', severity: 'warning' },
        { ts: '13:12:07', action: 'Alert CR-1823 acknowledged by Alpha shift', user: 'Officer Jiménez', ref: 'ALT-8831', severity: 'info' },
        { ts: '12:45:53', action: 'Cell Block B population count reconciled', user: 'Officer Rodríguez', ref: 'POP-3314', severity: 'info' },
        { ts: '11:30:21', action: 'Contraband intercept logged — Visitor Area', user: 'Sgt. Alvarado', ref: 'CNT-1104', severity: 'critical' },
        { ts: '10:17:38', action: 'Inmate CR-2048 transferred to Medical Wing', user: 'Nurse Castro', ref: 'MED-5521', severity: 'info' },
        { ts: '09:58:02', action: 'Access code rotation completed — all sectors', user: 'SYSTEM', ref: 'SEC-AUTH-901', severity: 'info' },
        { ts: '09:14:19', action: 'AI model retrain cycle initiated — Violence Predictor', user: 'SYSTEM', ref: 'AI-TRAIN-77', severity: 'info' },
        { ts: '08:42:55', action: 'Staff roster approved — Bravo shift handover', user: 'Commander González', ref: 'STAFF-2290', severity: 'info' },
        { ts: '07:30:00', action: 'Daily backup completed — all systems nominal', user: 'SYSTEM', ref: 'BKP-20260601', severity: 'info' },
    ];
    const [toast, setToast] = useState(null);
    const [exportModal, setExportModal] = useState(null);
    const [scheduleModal, setScheduleModal] = useState(null);
    const [viewModal, setViewModal] = useState(null);
    const now = new Date();
    const overdue = REPORTS.filter((r) => r.status === 'overdue').length;
    const dueSoon = REPORTS.filter((r) => r.status === 'due').length;
    const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 3000); };
    const exportReport = (r) => setExportModal(r);
    return (<div className="space-y-4">

      {exportModal && (
        <ActionModal
          title={`${t('rpt.exportBtn')} — ${exportModal.title}`}
          subtitle={`${exportModal.category} · ${exportModal.frequency} · ${t('rpt.chipRecipient')}: ${exportModal.recipient}`}
          fields={[
            { id: 'format', label: t('rpt.exportFormatLabel'), type: 'select', required: true, defaultValue: 'pdf', options: [
              { value: 'pdf', label: t('rpt.exportFormatPdf') },
              { value: 'xlsx', label: t('rpt.exportFormatXlsx') },
              { value: 'csv', label: t('rpt.exportFormatCsv') },
            ]},
            { id: 'classification', label: t('rpt.exportClassLabel'), type: 'select', required: true, options: [
              { value: 'restricted', label: t('rpt.exportClassRestricted') },
              { value: 'confidential', label: t('rpt.exportClassConfidential') },
              { value: 'secret', label: t('rpt.exportClassSecret') },
            ]},
            { id: 'recipient', label: t('rpt.exportRecipientLabel'), type: 'text', placeholder: t('rpt.exportRecipientPh'), defaultValue: exportModal.recipient },
            { id: 'notes', label: t('rpt.exportNotesLabel'), type: 'textarea', placeholder: t('rpt.exportNotesPh') },
          ]}
          confirmLabel={t('rpt.exportBtn')}
          confirmTone="primary"
          onConfirm={(vals) => { flash(`${exportModal.title} · ${vals.format.toUpperCase()}`); }}
          onClose={() => setExportModal(null)}
        />
      )}

      {scheduleModal && (
        <ActionModal
          title={t('common.scheduleReport')}
          subtitle={t('rpt.schedModalSubtitle')}
          fields={[
            { id: 'title', label: t('rpt.schedTitleLabel'), type: 'text', required: true, placeholder: t('rpt.schedTitlePh') },
            { id: 'category', label: t('rpt.schedCategoryLabel'), type: 'select', required: true, options: [
              { value: 'Operations', label: t('rpt.schedCatOps') },
              { value: 'Security', label: t('rpt.schedCatSecurity') },
              { value: 'Intelligence', label: t('rpt.schedCatIntel') },
              { value: 'Rehabilitation', label: t('rpt.schedCatRehab') },
              { value: 'Compliance', label: t('rpt.schedCatCompliance') },
              { value: 'Governance', label: t('rpt.schedCatGov') },
            ]},
            { id: 'frequency', label: t('rpt.schedFreqLabel'), type: 'select', required: true, options: [
              { value: 'Daily', label: t('rpt.schedFreqDaily') },
              { value: 'Weekly', label: t('rpt.schedFreqWeekly') },
              { value: 'Monthly', label: t('rpt.schedFreqMonthly') },
              { value: 'Quarterly', label: t('rpt.schedFreqQuarterly') },
              { value: 'Annual', label: t('rpt.schedFreqAnnual') },
            ]},
            { id: 'recipient', label: t('rpt.schedRecipientLabel'), type: 'text', required: true, placeholder: t('rpt.schedRecipientPh') },
          ]}
          confirmLabel={t('common.scheduleReport')}
          confirmTone="primary"
          onConfirm={(vals) => { flash(`"${vals.title}" — ${vals.frequency}`); }}
          onClose={() => setScheduleModal(null)}
        />
      )}

      {viewModal && (
        <ActionModal
          title={`${t('rpt.viewTitle')} — ${viewModal.title}`}
          subtitle={`${viewModal.id} · ${t('rpt.viewLastGen')}: ${viewModal.lastGenerated}`}
          fields={[
            { id: 'period', label: t('rpt.viewPeriodLabel'), type: 'select', defaultValue: 'last', options: [
              { value: 'last', label: t('rpt.viewPeriodLast') },
              { value: '7d', label: t('rpt.viewPeriod7d') },
              { value: '30d', label: t('rpt.viewPeriod30d') },
              { value: '90d', label: t('rpt.viewPeriod90d') },
            ]},
            { id: 'notes', label: t('rpt.viewNotesLabel'), type: 'textarea', placeholder: t('rpt.viewNotesPh') },
          ]}
          confirmLabel={t('rpt.viewConfirm')}
          confirmTone="primary"
          onConfirm={(vals) => { flash(`${viewModal.id} — ${vals.period}`); }}
          onClose={() => setViewModal(null)}
        />
      )}

      <PageHeader code="RPT" title={t('rpt.title')} subtitle={t('rpt.subtitle')} actions={<>
            {overdue > 0 && <Chip tone="danger" dot>{overdue} {t('rpt.chipOverdue')}</Chip>}
            {dueSoon > 0 && <Chip tone="warning">{dueSoon} {t('rpt.chipDueSoon')}</Chip>}
            <Chip tone="info">{clockDate(now)}</Chip>
            <button className="btn btn-primary" onClick={() => setScheduleModal(true)}><Icon name="reports" className="w-3.5 h-3.5"/> {t('common.scheduleReport')}</button>
          </>}/>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label={t('rpt.metricTemplates')} value={REPORTS.length} icon={<Icon name="reports" className="w-4 h-4"/>} tone="#38bdf8" sub={t('rpt.subScheduled')}/>
        <MetricCard label={t('rpt.metricGenerated')} value={86} icon={<Icon name="check" className="w-4 h-4"/>} tone="#10b981" sub={t('rpt.subTransmitted')}/>
        <MetricCard label={t('rpt.metricDueSoon')} value={dueSoon} icon={<Icon name="alert" className="w-4 h-4"/>} tone="#f59e0b" sub={t('rpt.subWithin3d')}/>
        <MetricCard label={t('rpt.metricOverdue')} value={overdue} icon={<Icon name="fire" className="w-4 h-4"/>} tone="#ef4444" sub={t('rpt.subImmediateAction')}/>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Report registry */}
        <Panel className="xl:col-span-2" title={t('rpt.reportRegistryTitle')} icon={<Icon name="reports" className="w-4 h-4"/>} subtitle={t('rpt.reportRegistrySub')} bodyClass="overflow-x-auto">
          <table className="dtable">
            <thead>
              <tr><th>{t('rpt.thId')}</th><th>{t('rpt.thReport')}</th><th>{t('rpt.thCategory')}</th><th>{t('rpt.thFreq')}</th><th>{t('rpt.thLast')}</th><th>{t('rpt.thNext')}</th><th>{t('rpt.thStatus')}</th><th>{t('rpt.thAction')}</th></tr>
            </thead>
            <tbody>
              {REPORTS.map((r) => {
            const tone = STATUS_TONE[r.status];
            return (<tr key={r.id}>
                    <td className="font-mono text-[10px] text-app-text-faint">{r.id}</td>
                    <td>
                      <p className="font-semibold text-app-text">{r.title}</p>
                      <p className="text-[9.5px] text-app-text-faint">{r.recipient}</p>
                    </td>
                    <td className="text-[11px] text-app-text-muted">{r.category}</td>
                    <td className="font-mono text-[10px] text-app-text-muted">{r.frequency}</td>
                    <td className="font-mono text-[10px] text-app-text-faint">{r.lastGenerated}</td>
                    <td className="font-mono text-[10px]" style={{ color: r.status === 'overdue' ? '#ef4444' : r.status === 'due' ? '#f59e0b' : undefined }}>{r.nextDue}</td>
                    <td><Chip tone={tone.chip} dot>{tone.label}</Chip></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="icon-btn" title={t('rpt.exportBtn')} onClick={() => exportReport(r)}>
                          <Icon name="reports" className="w-3.5 h-3.5"/>
                        </button>
                        <button className="icon-btn" title={t('rpt.viewConfirm')} onClick={() => setViewModal(r)}>
                          <Icon name="search" className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </td>
                  </tr>);
        })}
            </tbody>
          </table>
        </Panel>

        {/* Right column */}
        <div className="space-y-4">
          {/* Compliance checklist */}
          <Panel title={t('rpt.complianceDashTitle')} icon={<Icon name="check" className="w-4 h-4"/>} bodyClass="p-3 space-y-0">
            <KV k={t('rpt.idhab')} v={t('rpt.compCompliant')} color="#10b981"/>
            <KV k={t('rpt.mjsp')} v={t('rpt.compCompliant')} color="#10b981"/>
            <KV k={t('rpt.oij')} v={t('rpt.compInReview')} color="#f59e0b"/>
            <KV k={t('rpt.nationalAudit')} v={t('rpt.compScheduled')} color="#38bdf8"/>
            <KV k={t('rpt.inmateRights')} v={t('rpt.compCompliant')} color="#10b981"/>
            <KV k={t('rpt.segregation')} v={t('rpt.compCompliant')} color="#10b981"/>
            <KV k={t('rpt.medicalAccess')} v={t('rpt.compCompliant')} color="#10b981"/>
            <KV k={t('rpt.visitorProcessing')} v={t('rpt.compAttention')} color="#f59e0b"/>
            <KV k={t('rpt.dataRetention')} v={t('rpt.compCompliant')} color="#10b981"/>
            <KV k={t('rpt.auditLoggingLabel')} v={t('rpt.compActive')} color="#38bdf8"/>
          </Panel>

          {/* Quick exports */}
          <Panel title={t('rpt.quickExportTitle')} icon={<Icon name="reports" className="w-4 h-4"/>} bodyClass="p-3 space-y-2">
            {[
            { labelKey: 'rpt.qePopulation', icon: 'users' },
            { labelKey: 'rpt.qeIncidents', icon: 'incident' },
            { labelKey: 'rpt.qeAlerts', icon: 'bell' },
            { labelKey: 'rpt.qeStaff', icon: 'staff' },
            { labelKey: 'rpt.qeIntelligence', icon: 'intel' },
        ].map(({ labelKey, icon }) => {
          const label = t(labelKey);
          return (<button key={labelKey} onClick={() => setExportModal({ id: 'QUICK', title: label, category: t('rpt.schedCatOps'), frequency: 'On demand', lastGenerated: 'N/A', recipient: '' })} className="flex w-full items-center gap-2 rounded-md border border-app-border px-3 py-2 text-left transition-colors hover:border-app-border-strong" style={{ background: 'var(--app-bg-deep)' }}>
                <Icon name={icon} className="w-3.5 h-3.5 text-app-accent"/>
                <span className="text-[11px] font-medium text-app-text">{label}</span>
                <Icon name="reports" className="ml-auto w-3 h-3 text-app-text-faint"/>
              </button>);
        })}
          </Panel>
        </div>
      </div>

      {/* Audit trail */}
      <Panel title={t('rpt.auditTitle')} icon={<Icon name="activity" className="w-4 h-4"/>} subtitle={t('rpt.auditSub')} live bodyClass="overflow-x-auto">
        <table className="dtable">
          <thead><tr><th>{t('rpt.thTime')}</th><th>{t('rpt.thAction')}</th><th>{t('rpt.thUser')}</th><th>{t('rpt.thRef')}</th><th>{t('rpt.auditSeverity')}</th></tr></thead>
          <tbody>
            {AUDIT.map((a, i) => (<tr key={i}>
                <td className="font-mono text-[10px] text-app-text-faint">{a.ts}</td>
                <td className="text-[11px] text-app-text">{a.action}</td>
                <td className="font-mono text-[10px]">{a.user}</td>
                <td className="font-mono text-[10px] text-app-text-faint">{a.ref}</td>
                <td><Dot color={AUDIT_COLOR[a.severity]} size={7}/></td>
              </tr>))}
          </tbody>
        </table>
      </Panel>

      {toast && (<div className="fixed bottom-9 right-4 z-[400] animate-slide-up rounded-lg border px-4 py-3 text-xs font-semibold shadow-2xl" style={{ background: 'var(--app-panel-2)', borderColor: 'var(--app-accent-border)', color: 'var(--app-accent)' }}>
          <Icon name="check" className="mr-1.5 inline w-3.5 h-3.5"/>{toast}
        </div>)}
    </div>);
}
