import { useState, useEffect } from 'react';
import ActivityForm from './ActivityForm';
import ActivityList from './ActivityList';

/**
 * ActivitiesPage — combined view with tab to switch between
 * logging new activities and viewing the list
 */
export default function ActivitiesPage({
  categories,
  activities,
  activityLoading,
  onFetchCategories,
  onAddActivity,
  onFetchActivities,
  onUpdateActivity,
  onDeleteActivity,
}) {
  const [view, setView] = useState('log');

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* View switcher */}
      <div className="tab-bar" id="activity-view-toggle">
        <button
          className={`tab-btn ${view === 'log' ? 'active' : ''}`}
          onClick={() => setView('log')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Log
        </button>
        <button
          className={`tab-btn ${view === 'list' ? 'active' : ''}`}
          onClick={() => setView('list')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          View All
        </button>
      </div>

      {view === 'log' ? (
        <ActivityForm
          categories={categories}
          onAdd={onAddActivity}
          onFetchCategories={onFetchCategories}
        />
      ) : (
        <ActivityList
          activities={activities}
          loading={activityLoading}
          onFetch={onFetchActivities}
          onUpdate={onUpdateActivity}
          onDelete={onDeleteActivity}
          categories={categories}
        />
      )}
    </div>
  );
}
