import React from 'react';
import BasicInfoSection from './BasicInfoSection';
import ProcessControlSection from './ProcessControlSection';
import TrialReportSection from './TrialReportSection';
import DocumentsSection from './DocumentsSection';
import './FormSections.css';

export default function FormSections({ data, activeSection, onChange, onNext, currentUser, factories, highlightField }) {
  return (
    <div className="sections-container glass-card">
      {activeSection === 'basicInfo' && (
        <BasicInfoSection {...{ data, onChange, currentUser, factories, highlightField, onNext }} />
      )}
      {activeSection === 'processControl' && (
        <ProcessControlSection {...{ data, onChange, currentUser, highlightField, onNext }} />
      )}
      {activeSection === 'trialReport' && (
        <TrialReportSection {...{ data, onChange, currentUser, highlightField, onNext }} />
      )}
      {activeSection === 'documents' && (
        <DocumentsSection {...{ data, onChange, currentUser, highlightField, onNext }} />
      )}
    </div>
  );
}
