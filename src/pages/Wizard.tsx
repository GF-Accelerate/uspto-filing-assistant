import { useNavigate } from 'react-router-dom'
import type { Patent } from '@/types/patent'
import type { useWizard } from '@/hooks/useWizard'
import { useClaudeAPI } from '@/hooks/useClaudeAPI'
import { saveReceipt } from '@/lib/filing-receipts'
import { transitionStatus } from '@/lib/patent-lifecycle'
import { WizardShell } from '@/components/wizard/WizardShell'
import { Step1Input }      from '@/components/wizard/Step1Input'
import { Step2Analysis }   from '@/components/wizard/Step2Analysis'
import { Step3CoverSheet } from '@/components/wizard/Step3CoverSheet'
import { Step4Checklist }  from '@/components/wizard/Step4Checklist'
import { Step5FilingGuide} from '@/components/wizard/Step5FilingGuide'
import { Step6Receipt }    from '@/components/wizard/Step6Receipt'

interface Props {
  ctx: ReturnType<typeof useWizard>
  portfolio: Patent[]
  onMarkFiled: (id: string, appNum: string) => void
}

export function Wizard({ ctx, portfolio, onMarkFiled }: Props) {
  const navigate   = useNavigate()
  const { wizard, open, close, setStep, update, toggleCheck, hasSavedSession, resumeSaved, discardSaved } = ctx
  const api        = useClaudeAPI({ wizard, update, setStep })

  if (!wizard.activePatentId) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
        {hasSavedSession && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left max-w-md mx-auto">
            <p className="text-sm font-medium text-blue-800 mb-2">Resume previous session?</p>
            <p className="text-xs text-blue-600 mb-3">You have an unsaved wizard session. Would you like to continue where you left off?</p>
            <div className="flex gap-2">
              <button onClick={resumeSaved} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Resume
              </button>
              <button onClick={discardSaved} className="px-3 py-1.5 bg-white text-slate-600 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                Discard
              </button>
            </div>
          </div>
        )}
        <p className="text-slate-500 mb-4 text-sm">Select a patent to begin the filing wizard</p>
        <div className="flex flex-col gap-2 max-w-md mx-auto mb-6">
          {portfolio.filter(p => p.status !== 'filed').map(p => (
            <button key={p.id} onClick={() => open(p.id)}
              className="text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="text-xs text-slate-400 mb-0.5">{p.id}</div>
              <div className="text-sm font-medium text-slate-800">{p.title}</div>
            </button>
          ))}
        </div>
        <button onClick={() => navigate('/')} className="btn-secondary text-sm px-4 py-2">
          ← Back to Portfolio
        </button>
      </div>
    )
  }

  const patent = portfolio.find(p => p.id === wizard.activePatentId)!

  return (
    <WizardShell
      title={patent.title}
      patentId={patent.id}
      step={wizard.step}
      onStep={setStep}
    >
      {wizard.step === 1 && (
        <Step1Input
          patentId={patent.id}
          value={wizard.docInput}
          onChange={v => update({ docInput: v })}
          onAnalyze={api.extract}
          loading={wizard.loading}
        />
      )}

      {wizard.step === 2 && wizard.aiData && (
        <Step2Analysis
          data={wizard.aiData}
          loading={wizard.loading}
          onNext={api.generateCoverSheet}
          onBack={() => setStep(1)}
        />
      )}

      {wizard.step === 3 && (
        <Step3CoverSheet
          data={wizard.coverData}
          onGenerate={api.generateCoverSheet}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
          loading={wizard.loading}
        />
      )}

      {wizard.step === 4 && (
        <Step4Checklist
          checks={wizard.checks}
          validResult={wizard.validResult}
          onToggle={toggleCheck}
          onBack={() => setStep(3)}
          onValidate={api.validate}
          onNext={() => setStep(5)}
          loading={wizard.loading}
        />
      )}

      {wizard.step === 5 && (
        <Step5FilingGuide
          aiData={wizard.aiData}
          patentId={patent.id}
          onBack={() => setStep(4)}
          onNext={() => setStep(6)}
        />
      )}

      {wizard.step === 6 && (
        <Step6Receipt
          appNum={wizard.appNum}
          onChange={v => update({ appNum: v })}
          onBack={() => setStep(5)}
          onSave={() => {
            if (wizard.appNum) {
              const patentId = wizard.activePatentId!
              const today = new Date().toISOString().split('T')[0]
              const deadlineDate = new Date()
              deadlineDate.setFullYear(deadlineDate.getFullYear() + 1)

              // Save filing receipt
              saveReceipt({
                patentId,
                appNumber: wizard.appNum,
                filingDate: today,
                nonprovisionalDeadline: deadlineDate.toISOString().split('T')[0],
                entityStatus: 'Small Entity',
                feesPaid: 320,
              })

              // Record lifecycle transition
              const patent = portfolio.find(p => p.id === patentId)
              if (patent) {
                transitionStatus(patentId, patent.status, 'filed', `Filed as ${wizard.appNum}`, wizard.appNum)
              }

              onMarkFiled(patentId, wizard.appNum)
              close()
              navigate('/')
            }
          }}
        />
      )}
    </WizardShell>
  )
}
