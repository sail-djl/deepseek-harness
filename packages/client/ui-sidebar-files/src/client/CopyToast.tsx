/**
 * Transient outcome notice for path copies from the file tree.
 *
 * Every copy reports its settled clipboard result into one store, and one
 * `shell.overlay` entry renders it as the app-wide banner, so the outcome
 * outlives the tab the copy started in.
 */
import type { ReactNode } from 'react'
import { IconWarningOutlineRegular, Toast } from '@deepseek-ai/dsh-client-ui-primitives'
import type { HostObservable, InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'

/** One settled path-copy outcome the toast reports. */
export type CopyOutcome = 'copied' | 'copyFailed'

/** One reported copy outcome; `seq` keys the banner so a re-show restarts it. */
export interface CopyToastState {
  readonly kind: CopyOutcome
  readonly seq: number
}

/** Store the copy wiring reports into and the overlay entry reads. */
export interface CopyToastSource {
  /** Current notice for the overlay entry, or null while none shows. */
  readonly hooks: { readonly toast: HostObservable<CopyToastState | null> }
  /**
   * Show the notice of one settled copy.
   * @param outcome - settled clipboard result of one path copy.
   */
  readonly report: (outcome: CopyOutcome) => void
  /** Clear the shown notice. */
  readonly dismiss: () => void
}

/**
 * Create the one path-copy outcome store the overlay entry shows.
 * @returns the observable notice with its report and dismiss actions.
 */
export function createCopyToastSource(): CopyToastSource {
  let state: CopyToastState | null = null
  let seq = 0
  const listeners = new Set<() => void>()
  const publish = (next: CopyToastState | null): void => {
    state = next
    for (const listener of listeners) listener()
  }
  return {
    hooks: {
      toast: {
        getSnapshot: () => state,
        subscribe(listener) {
          listeners.add(listener)
          return () => { listeners.delete(listener) }
        },
      },
    },
    report: (outcome) => { publish({ kind: outcome, seq: ++seq }) },
    dismiss: () => { publish(null) },
  }
}

/** Props of the `shell.overlay` entry: the notice store and localized copy. */
export type FilesCopyToastProps = PropsRuntime<'shell.overlay'>
  & PropsLocale<'sidebarFiles'>
  & InjectFace<Omit<CopyToastSource, 'report'>>

/**
 * Render the current copy notice: a success banner for an accepted write, a
 * warning for one the clipboard refused, or nothing.
 * @param props - the notice hook, its dismissal, and the locale seat.
 * @returns the banner on display, or null.
 */
export function FilesCopyToast({ useToast, dismiss, t }: FilesCopyToastProps): ReactNode {
  const toast = useToast(current => current)
  if (toast === null) return null
  return toast.kind === 'copied'
    ? <Toast key={`files-copy-${String(toast.seq)}`} text={t('toast.copied')} tone="success" onDone={dismiss} />
    : <Toast
      key={`files-copy-${String(toast.seq)}`}
      text={t('toast.copyFailed')}
      icon={<IconWarningOutlineRegular />}
      onDone={dismiss}
    />
}
