import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'

export function Guide() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="USPTO API landscape" />
        <CardBody>
          <Alert variant="danger" className="mb-4"><strong>No filing API exists.</strong> USPTO has no public REST endpoint to submit patent applications. All filing requires Patent Center with ID.me identity-verified authentication.</Alert>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:'Patent File Wrapper API', url:'data.uspto.gov', desc:'Search app status, retrieve documents', type:'read' },
              { label:'Patent Assignment API', url:'developer.uspto.gov', desc:'Retrieve ownership data', type:'read' },
              { label:'TSDR Trademark API', url:'developer.uspto.gov', desc:'Trademark status and documents', type:'read' },
              { label:'PatentsView API', url:'data.uspto.gov', desc:'Historical patent data, citations', type:'read' },
              { label:'Patent Center Workbench v2', url:'patentcenter.uspto.gov', desc:'View your filed apps (auth required)', type:'auth' },
              { label:'Filing endpoint', url:'Does not exist', desc:'Submit new applications', type:'none' },
            ].map(api => (
              <div key={api.label} className="bg-slate-50 rounded p-3">
                <span className={['text-xs px-2 py-0.5 rounded font-medium mb-2 inline-block', api.type==='read'?'bg-green-100 text-green-700':api.type==='none'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'].join(' ')}>
                  {api.type==='read'?'READ ONLY':api.type==='none'?'NOT AVAILABLE':'AUTH REQUIRED'}
                </span>
                <div className="text-sm font-medium text-slate-800 mb-0.5">{api.label}</div>
                <div className="text-xs font-mono text-slate-400 mb-1">{api.url}</div>
                <div className="text-xs text-slate-500">{api.desc}</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Playwright MCP filing agent — Phase 2 architecture" />
        <CardBody>
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">Build a Playwright MCP server that controls Patent Center after you authenticate. You log in, hand off to the agent — it fills all forms, uploads documents, stops at payment for your approval.</p>
          <div className="bg-slate-900 text-green-400 rounded p-4 font-mono text-xs leading-relaxed">
            <div className="text-slate-500 mb-2"># Playwright HITL filing agent workflow</div>
            <div>1. You open patentcenter.uspto.gov + complete ID.me + MFA</div>
            <div>2. Click "Hand off to AI agent" in this app</div>
            <div>3. Agent: File → New Application → Provisional</div>
            <div>4. Agent fills ADS from extracted filing data</div>
            <div>5. Agent uploads specification + cover sheet</div>
            <div>6. Agent selects Small Entity + fee type</div>
            <div className="text-amber-400">7. HITL GATE: stops → you review + enter payment</div>
            <div className="text-amber-400">8. YOU click Submit (only you can do this)</div>
            <div>9. Agent records Application Number from receipt</div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Built with: <code className="font-mono">@playwright/mcp</code> + Claude tool use + this app as the HITL coordination layer.</p>
        </CardBody>
      </Card>
    </div>
  )
}
