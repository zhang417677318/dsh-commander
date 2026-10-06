import StatusFlow from './StatusFlow'
import type { CommanderIdentity, CommanderStage } from '../../domain/types'
import './commander.css'

function CommanderAvatar({ size }: { size: 'sm' | 'lg' }) {
  return (
    <span className={`av ${size === 'lg' ? 'av-74 av-ring' : 'av-32'}`} aria-hidden="true">
      <img src="avatar.png" alt="" onError={(event) => event.currentTarget.remove()} />
      <svg className="art" viewBox="0 0 64 64">
        <path
          d="M32 10.8c-9.8 0-15.8 6.1-15.8 15.2 0 6 1.6 11.2 4.2 15.8l-1.1 6.6h25.4l-1.1-6.6c2.6-4.6 4.2-9.8 4.2-15.8 0-9.1-6-15.2-15.8-15.2z"
          fill="#0B5D74"
          fillOpacity={0.45}
        />
        <ellipse cx="32" cy="28.6" rx="8.5" ry="10.1" fill="#FFFFFF" fillOpacity={0.96} />
        <path
          d="M32 40.6c-9 0-16.3 5.7-16.3 13.3V64h32.6V53.9c0-7.6-7.3-13.3-16.3-13.3z"
          fill="#FFFFFF"
          fillOpacity={0.96}
        />
      </svg>
    </span>
  )
}

export interface CommanderBannerProps {
  commander: CommanderIdentity
  stage: CommanderStage
}

export function CommanderBanner({ commander, stage }: CommanderBannerProps) {
  return (
    <section className="glass banner" aria-labelledby="commander-title">
      <CommanderAvatar size="lg" />

      <div className="banner-copy">
        <div className="banner-title">
          <h2 id="commander-title">{commander.name}</h2>
          <span className="tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m12 3 2.3 5.4 5.7.5-4.4 3.8 1.3 5.6L12 15.6 7.1 18.3l1.3-5.6-4.4-3.8 5.7-.5z" />
            </svg>
            {commander.model}
          </span>
        </div>
        <p>{commander.greeting}</p>
        <StatusFlow stage={stage} />
      </div>

      <div className="banner-slogan">
        <strong>
          让美业的每一个
          <br />
          想法都变成现实
        </strong>
        <span>AI FOR BEAUTY</span>
      </div>
    </section>
  )
}

export default CommanderBanner
