import React from 'react';
import { CampusBuildingInfo } from '../../models/campus/campusBuildings';

export interface BreadcrumbProps {
  selected: CampusBuildingInfo | null;
  /** Clears selection and returns the camera to the campus overview. */
  onReset: () => void;
}

const KIND_LABEL: Record<CampusBuildingInfo['kind'], string> = {
  housing: 'Housing',
  medical: 'Medical',
  admin: 'Administration',
  yard: 'Recreation',
};

/** Location breadcrumb: Campus › [Sector] › Building. Root/segment clicks reset the view. */
export default function Breadcrumb({ selected, onReset }: BreadcrumbProps) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-md px-3 py-1.5"
      style={{ background: 'rgba(6,14,22,0.82)', border: '1px solid var(--app-border)' }}
    >
      <button
        onClick={onReset}
        className="font-mono text-[11px] font-semibold hover:underline"
        style={{ color: selected ? 'var(--app-text-faint)' : 'var(--app-accent)' }}
      >
        Campus
      </button>
      {selected && (
        <>
          <span className="text-[11px] text-app-text-faint">›</span>
          <span className="text-[11px] text-app-text-faint">{KIND_LABEL[selected.kind]}</span>
          <span className="text-[11px] text-app-text-faint">›</span>
          <span className="font-mono text-[10px] font-bold" style={{ color: 'var(--app-accent)' }}>{selected.id}</span>
          <span className="text-[11px] font-semibold text-app-text">{selected.label}</span>
        </>
      )}
    </div>
  );
}
