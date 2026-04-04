import { useState, useCallback } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { getInventorProfiles, getAssigneeProfiles, saveInventorProfile, saveAssigneeProfile, deleteInventorProfile, deleteAssigneeProfile } from '@/lib/profiles'
import type { InventorProfile, AssigneeProfile } from '@/lib/profiles'

export function Settings() {
  const [inventors, setInventors] = useState<InventorProfile[]>(() => getInventorProfiles())
  const [assignees, setAssignees] = useState<AssigneeProfile[]>(() => getAssigneeProfiles())
  const [saved, setSaved] = useState(false)

  const flash = useCallback(() => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }, [])

  const handleDeleteInventor = useCallback((id: string) => {
    deleteInventorProfile(id)
    setInventors(getInventorProfiles())
    flash()
  }, [flash])

  const handleDeleteAssignee = useCallback((id: string) => {
    deleteAssigneeProfile(id)
    setAssignees(getAssigneeProfiles())
    flash()
  }, [flash])

  const handleAddInventor = useCallback(() => {
    saveInventorProfile({
      id: `inv-${Date.now()}`,
      name: '',
      address: '',
      citizenship: 'US',
      isPrimary: false,
    })
    setInventors(getInventorProfiles())
  }, [])

  const handleUpdateInventor = useCallback((profile: InventorProfile) => {
    saveInventorProfile(profile)
    setInventors(getInventorProfiles())
    flash()
  }, [flash])

  const handleAddAssignee = useCallback(() => {
    saveAssigneeProfile({
      id: `asg-${Date.now()}`,
      name: '',
      address: '',
      type: 'Corporation',
      state: '',
      isDefault: false,
    })
    setAssignees(getAssigneeProfiles())
  }, [])

  const handleUpdateAssignee = useCallback((profile: AssigneeProfile) => {
    saveAssigneeProfile(profile)
    setAssignees(getAssigneeProfiles())
    flash()
  }, [flash])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500">Manage inventor profiles, assignee info, and app preferences</p>
        </div>
        {saved && <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">Saved</span>}
      </div>

      <Alert variant="info">
        <strong>Entity status:</strong> Small Entity — $320 filing fee per provisional (2026).
        All data is stored locally in your browser. Future versions will sync to the cloud.
      </Alert>

      {/* Inventor Profiles */}
      <Card>
        <CardHeader title="Inventor Profiles" right={
          <Button size="sm" onClick={handleAddInventor}>+ Add Inventor</Button>
        } />
        <CardBody>
          {inventors.length === 0 ? (
            <p className="text-sm text-slate-400">No inventor profiles. Click "Add Inventor" to create one.</p>
          ) : (
            <div className="space-y-4">
              {inventors.map(inv => (
                <div key={inv.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Full Name</label>
                      <input
                        value={inv.name}
                        onChange={e => handleUpdateInventor({ ...inv, name: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm"
                        placeholder="Legal name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Citizenship</label>
                      <input
                        value={inv.citizenship}
                        onChange={e => handleUpdateInventor({ ...inv, citizenship: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm"
                        placeholder="US"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-slate-500 mb-1">Address</label>
                      <input
                        value={inv.address}
                        onChange={e => handleUpdateInventor({ ...inv, address: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm"
                        placeholder="City, State ZIP"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={inv.isPrimary}
                        onChange={e => handleUpdateInventor({ ...inv, isPrimary: e.target.checked })}
                      />
                      Primary inventor
                    </label>
                    <button onClick={() => handleDeleteInventor(inv.id)} className="text-xs text-red-500 hover:text-red-700">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Assignee Profiles */}
      <Card>
        <CardHeader title="Assignee Profiles" right={
          <Button size="sm" onClick={handleAddAssignee}>+ Add Assignee</Button>
        } />
        <CardBody>
          {assignees.length === 0 ? (
            <p className="text-sm text-slate-400">No assignee profiles.</p>
          ) : (
            <div className="space-y-4">
              {assignees.map(asg => (
                <div key={asg.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Company Name</label>
                      <input
                        value={asg.name}
                        onChange={e => handleUpdateAssignee({ ...asg, name: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Entity Type</label>
                      <input
                        value={asg.type}
                        onChange={e => handleUpdateAssignee({ ...asg, type: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Inc. State</label>
                      <input
                        value={asg.state}
                        onChange={e => handleUpdateAssignee({ ...asg, state: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Address</label>
                      <input
                        value={asg.address}
                        onChange={e => handleUpdateAssignee({ ...asg, address: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm"
                      />
                    </div>
                    {asg.ein !== undefined && (
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">EIN</label>
                        <input
                          value={asg.ein || ''}
                          onChange={e => handleUpdateAssignee({ ...asg, ein: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm"
                        />
                      </div>
                    )}
                    {asg.stateId !== undefined && (
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">State ID</label>
                        <input
                          value={asg.stateId || ''}
                          onChange={e => handleUpdateAssignee({ ...asg, stateId: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-200 rounded text-sm"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={asg.isDefault}
                        onChange={e => handleUpdateAssignee({ ...asg, isDefault: e.target.checked })}
                      />
                      Default assignee
                    </label>
                    <button onClick={() => handleDeleteAssignee(asg.id)} className="text-xs text-red-500 hover:text-red-700">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader title="Appearance" />
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Dark Mode</p>
              <p className="text-xs text-slate-400">Toggle between light and dark themes</p>
            </div>
            <button
              onClick={() => {
                const next = document.documentElement.classList.toggle('dark')
                localStorage.setItem('uspto-dark-mode', String(next))
              }}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-slate-200"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                localStorage.getItem('uspto-dark-mode') === 'true' ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </CardBody>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader title="Application Info" />
        <CardBody>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500">Company:</span> <span className="font-medium">Visionary AI Systems, Inc.</span></div>
            <div><span className="text-slate-500">Incorporation:</span> <span className="font-medium">Delaware (ID: 10468520)</span></div>
            <div><span className="text-slate-500">EIN:</span> <span className="font-medium">41-3757112</span></div>
            <div><span className="text-slate-500">Entity Status:</span> <span className="font-medium">Small Entity</span></div>
            <div><span className="text-slate-500">Filing Fee:</span> <span className="font-medium">$320 (2026)</span></div>
            <div><span className="text-slate-500">Storage:</span> <span className="font-medium">localStorage (local only)</span></div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
