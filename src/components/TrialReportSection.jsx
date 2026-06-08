import React from 'react';
import { useFieldOwner } from '../hooks/useFieldOwner';
import { isFieldDisabled, getFieldHighlightClass, updateFieldWithOwner } from '../utils/fieldUtils';
import { sectionSvg } from '../utils/svgIcons';
import './FormSections.css';

export default function TrialReportSection({ data, onChange, currentUser, highlightField, onNext }) {
  const { setField } = useFieldOwner(onChange, currentUser);

  const handleRecordChange = (category, index, field, val) => {
    onChange(prev => {
      const tr = prev.trialReport || {};
      const records = tr[category] ? [...tr[category]] : [];
      if (!records[index]) records[index] = {};
      records[index] = { ...records[index], [field]: val };
      return updateFieldWithOwner({ ...prev, trialReport: { ...tr, [category]: records } },
        `trialReport.${category}.${index}.${field}`, val, currentUser?.unit);
    });
  };

  const handleXrayPartChange = (partIdx, val) => {
    onChange(prev => {
      const tr = prev.trialReport || {};
      const records = tr.photoRecords ? [...tr.photoRecords] : [];
      const xrayIdx = records.findIndex(r => r.isXray);
      if (xrayIdx === -1) return prev;
      const parts = [...(records[xrayIdx].parts || ['', '', '', ''])];
      parts[partIdx] = val;
      records[xrayIdx] = { ...records[xrayIdx], parts };
      const path = `trialReport.photoRecords.xray.parts.${partIdx}`;
      return updateFieldWithOwner({ ...prev, trialReport: { ...tr, photoRecords: records } },
        path, val, currentUser?.unit);
    });
  };

  return (
    <div className={`section-form animate-fade-in ${getFieldHighlightClass(highlightField, 'trialReport')}`}>
      <h2 className="section-title">試產要求</h2>
      <h3 className="sub-section-title"><span className="card-icon-circle card-icon-sm">{sectionSvg.clipboard}</span>試產交付文件、檢驗紀錄與照片清單</h3>
      <p className="description-text">請勾選確認已完成的項目以利兩端追蹤。</p>

      <div className="record-list-section">
        <h4 className="list-group-title" data-accent="blue"><span className="card-icon-circle card-icon-xs">{sectionSvg.printer}</span>A. 印刷品質 / 迴焊紀錄</h4>
        <div className="records-grid">
          {data.trialReport?.printRecords?.map((rec, idx) => (
            <div key={rec.id} className="record-row edit-active" style={{ margin: 0 }}>
              <label className="checkbox-label flex-1">
                <input type="checkbox" checked={rec.checked || false}
                  onChange={(e) => handleRecordChange('printRecords', idx, 'checked', e.target.checked)}
                  disabled={isFieldDisabled(data, currentUser, `trialReport.printRecords.${idx}.checked`)} />
                <span className="record-name">{rec.name}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="record-list-section">
        <h4 className="list-group-title" data-accent="purple"><span className="card-icon-circle card-icon-xs">{sectionSvg.search}</span>B. 檢驗紀錄</h4>
        <div className="records-grid">
          {data.trialReport?.inspectRecords?.map((rec, idx) => (
            <div key={rec.id} className="record-row edit-active" style={{ margin: 0 }}>
              <label className="checkbox-label flex-1">
                <input type="checkbox" checked={rec.checked || false}
                  onChange={(e) => handleRecordChange('inspectRecords', idx, 'checked', e.target.checked)}
                  disabled={isFieldDisabled(data, currentUser, `trialReport.inspectRecords.${idx}.checked`)} />
                <span className="record-name">{rec.name}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="record-list-section">
        <h4 className="list-group-title" data-accent="emerald"><span className="card-icon-circle card-icon-xs">{sectionSvg.chart}</span>C. SMT 生產良率報告（含可製造性設計問題分析 DFM）</h4>
        <div className="records-grid">
          <div className="record-row edit-active" style={{ margin: 0 }}>
            <label className="checkbox-label flex-1">
              <input type="checkbox" checked={data.trialReport?.yieldReport?.ready || false}
                onChange={(e) => setField('trialReport.yieldReport.ready', e.target.checked)}
                disabled={isFieldDisabled(data, currentUser, 'trialReport.yieldReport.ready')} />
              <span className="record-name">SMT 良率報告已備妥</span>
            </label>
          </div>
        </div>
      </div>

      <div className="record-list-section">
        <h4 className="list-group-title" data-accent="pink"><span className="card-icon-circle card-icon-xs">{sectionSvg.camera}</span>D. 照片提供</h4>
        <div className="records-grid">
          {data.trialReport?.photoRecords?.map((rec, idx) => (
            <div key={rec.id} className="record-row edit-active" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', margin: 0 }}>
              <label className="checkbox-label flex-1" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                <input type="checkbox" checked={rec.checked || false}
                  onChange={(e) => handleRecordChange('photoRecords', idx, 'checked', e.target.checked)}
                  disabled={isFieldDisabled(data, currentUser, `trialReport.photoRecords.${idx}.checked`)} />
                <span className="record-name">
                  {rec.isXray ? String(rec.name).split(/指定零件/)[0] + '指定零件:' : rec.name}
                </span>
              </label>
              {rec.isXray && (
                <div className="xray-parts-inputs animate-fade-in" style={{ display: 'flex', gap: '8px', marginLeft: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {[0, 1, 2, 3].map((pIdx) => (
                    <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{pIdx + 1}:</span>
                      <input type="text" className="form-input edit-active compact" placeholder={pIdx === 0 ? '預設空白' : `U${pIdx + 1}`}
                        value={rec.parts?.[pIdx] || ''}
                        onChange={(e) => handleXrayPartChange(pIdx, e.target.value)}
                        disabled={isFieldDisabled(data, currentUser, `trialReport.photoRecords.xray.parts.${pIdx}`)}
                        style={{ width: '70px', padding: '2px 4px', fontSize: '0.8rem' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="action-row">
        <button className="btn btn-primary" onClick={onNext}>下一步：工程文件一覽表</button>
      </div>
    </div>
  );
}
