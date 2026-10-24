// @vitest-environment jsdom
/** The app-wide path-copy toast: one outcome store behind one overlay banner. */
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { makeTranslate } from '@deepseek-ai/dsh-client-test-runtime'
import {
  createCopyToastSource, FilesCopyToast,
  type CopyToastState, type FilesCopyToastProps,
} from '../src/client/CopyToast.tsx'
import { en, zh } from '../src/client/locales.ts'

afterEach(() => { cleanup(); vi.useRealTimers() })

function mount(state: CopyToastState | null, dictionary: typeof en | typeof zh = en) {
  const dismiss = vi.fn()
  const props = {
    useToast: <T,>(select: (value: CopyToastState | null) => T): T => select(state),
    dismiss,
    t: makeTranslate(dictionary),
  } as FilesCopyToastProps
  return { view: render(<FilesCopyToast {...props} />), dismiss }
}

describe('copy toast source', () => {
  it('publishes each settled outcome under a new sequence and clears on dismiss', () => {
    const source = createCopyToastSource()
    const listener = vi.fn()
    const stop = source.hooks.toast.subscribe(listener)
    expect(source.hooks.toast.getSnapshot()).toBeNull()

    source.report('copied')
    expect(source.hooks.toast.getSnapshot()).toEqual({ kind: 'copied', seq: 1 })
    source.report('copyFailed')
    expect(source.hooks.toast.getSnapshot()).toEqual({ kind: 'copyFailed', seq: 2 })
    // The next outcome advances the sequence, so a re-shown banner restarts.
    source.report('copied')
    expect(source.hooks.toast.getSnapshot()).toEqual({ kind: 'copied', seq: 3 })
    source.dismiss()
    expect(source.hooks.toast.getSnapshot()).toBeNull()
    expect(listener).toHaveBeenCalledTimes(4)

    stop()
    source.report('copied')
    expect(listener).toHaveBeenCalledTimes(4)
  })
})

describe('FilesCopyToast', () => {
  it('renders nothing while no outcome shows', () => {
    mount(null)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('shows the success banner for an accepted write and dismisses once done', () => {
    vi.useFakeTimers()
    const { dismiss } = mount({ kind: 'copied', seq: 1 })
    expect(screen.getByRole('alert').textContent).toBe(en['toast.copied'])
    act(() => { vi.runAllTimers() })
    expect(dismiss).toHaveBeenCalledOnce()
  })

  it('shows the warning banner for a write the clipboard refused', () => {
    mount({ kind: 'copyFailed', seq: 2 }, zh)
    expect(screen.getByRole('alert').textContent).toBe(zh['toast.copyFailed'])
  })
})
