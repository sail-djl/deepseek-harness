import { describe, expect, it } from 'vitest'
import { desktopMessages, en, formatDesktopMessage, resolveDesktopLocale, resolveDesktopStartupLocale, zh } from '../src/locale.ts'

describe('desktop locale dictionaries', () => {
  it('ships the same key set in English and Chinese', () => {
    expect(Object.keys(zh)).toEqual(Object.keys(en))
    expect(resolveDesktopLocale('zh-Hans-CN').messages).toEqual(desktopMessages(zh, 'DeepSeek Harness'))
    expect(resolveDesktopLocale('en-US').messages).toEqual(desktopMessages(en, 'DeepSeek Harness'))
    expect(resolveDesktopLocale('fr-FR').messages).toEqual(desktopMessages(en, 'DeepSeek Harness'))
  })

  it('substitutes the launch brand into brand placeholders only', () => {
    const branded = resolveDesktopLocale('zh-CN', 'Baizhou DSH Code').messages
    expect(branded.aboutMenu).toBe('关于 Baizhou DSH Code')
    expect(branded.aboutProduct).toBe('Baizhou DSH Code')
    expect(branded.welcomeTaglineBrand).toBe('Baizhou DSH Code')
    expect(branded.startupFailed).toBe('Baizhou DSH Code 无法使用')
    expect(branded.aboutVersion).toBe('版本 V{version}')
    expect(resolveDesktopLocale('en', 'Baizhou DSH Code').messages.updateTitle).toBe('Baizhou DSH Code Update')
    expect(resolveDesktopLocale('en').messages.aboutProduct).toBe('DeepSeek Harness')
    expect(resolveDesktopStartupLocale('zh', ['zh-CN'], 'Baizhou DSH Code').messages.quitTitle).toBe('退出 Baizhou DSH Code？')
  })

  it('formats named values without consuming unknown placeholders', () => {
    expect(formatDesktopMessage('{name}@{version} {missing}', { name: 'plugin', version: '1.2.3' }))
      .toBe('plugin@1.2.3 {missing}')
  })

  it('prefers an explicit supported choice, then the first supported system language', () => {
    expect(resolveDesktopStartupLocale('zh', ['en-US']).id).toBe('zh-CN')
    expect(resolveDesktopStartupLocale('EN', ['zh-CN']).id).toBe('en')
    expect(resolveDesktopStartupLocale(null, ['ja-JP', 'zh-Hant', 'en-US']).id).toBe('zh-CN')
    expect(resolveDesktopStartupLocale(null, ['en-US', 'zh-CN']).id).toBe('en')
    expect(resolveDesktopStartupLocale(null, ['ja-JP']).id).toBe('en')
    expect(resolveDesktopStartupLocale(null, []).id).toBe('en')
    expect(resolveDesktopStartupLocale('ja', ['zh-CN']).id).toBe('zh-CN')
  })

})
