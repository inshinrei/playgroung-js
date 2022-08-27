import gsap from 'gsap'
import { getCSSVar } from '../../../utils/css'

const { to, set, fromTo } = gsap

export const registerEventListeners = () => {
  document.querySelectorAll('.radio').forEach(element => {
    const svg = element.querySelector('svg'),
      input = element.querySelector('input')

    input?.addEventListener('change', () => {
      fromTo(
        input,
        { '--border-width': '3px' },
        { '--border-color': getCSSVar('--c-active'), '--border-width': '12px', duration: 0.2 }
      )

      to(svg, {
        keyframes: [
          { '--top-y': '6px', '--top-s-x': 1, '--top-s-y': 1.25, duration: 0.2, delay: 0.2 },
          { '--top-y': '0px', '--top-s-x': 1.75, '--top-s-y': 1, duration: 0.6 },
        ],
      })

      to(svg, {
        keyframes: [
          { '--dot-y': '2px', duration: 0.3, delay: 0.2 },
          { '--dot-y': '0px', duration: 0.3 },
        ],
      })

      to(svg, {
        '--drop-y': '0px',
        duration: 0.6,
        delay: 0.4,
        clearProps: true,
        onComplete: () => {
          input.removeAttribute('style')
        },
      })
    })
  })

  document.querySelectorAll('.checkbox').forEach(element => {
    const svg = element.querySelector('svg'),
      input = element.querySelector('input')

    input?.addEventListener('change', () => {
      const { checked } = input

      if (!checked) {
        return
      }

      fromTo(
        input,
        { '--border-width': '3px' },
        {
          '--border-color': getCSSVar('--c-active'),
          '--border-width': '12px',
          duration: 0.2,
          clearProps: true,
        }
      )

      set(svg, {
        '--dot-x': '14px',
        '--dot-y': '-14px',
        '--tick-offset': '20.5px',
        '--tick-array': '16.5px',
        '--drop-s': 1,
      })

      to(element, {
        keyframes: [
          {
            '--border-radius-corner': '14px',
            duration: 0.2,
            delay: 0.2,
          },
          {
            '--border-radius-corner': '5px',
            duration: 0.3,
            clearProps: true,
          },
        ],
      })

      to(svg, {
        '--dot-x': '0px',
        '--dot-y': '0px',
        '--dot-s': 1,
        duration: 0.4,
        delay: 0.4,
      })

      to(svg, {
        keyframes: [
          {
            '--tick-offset': '48px',
            '--tick-array': '14px',
            duration: 0.3,
            delay: 0.2,
          },
          {
            '--tick-offset': '46.5px',
            '--tick-array': '16.5px',
            duration: 0.35,
            clearProps: true,
          },
        ],
      })
    })
  })

  document.querySelectorAll('.switch').forEach(element => {
    const svg = element.querySelector('svg'),
      input = element.querySelector('input')

    input?.addEventListener('pointerenter', () => {
      if ((element as any).animated || input.checked) {
        return
      }

      to(input, {
        '--input-background': getCSSVar('--c-default-dark'),
        duration: 0.2,
      })
    })

    input?.addEventListener('pointerleave', () => {
      if ((element as any).animated || input.checked) {
        return
      }

      to(input, {
        '--input-background': getCSSVar('--c-default'),
        duration: 0.2,
      })
    })

    input?.addEventListener('change', () => {
      const { checked } = input
      const hide = checked ? 'default' : 'dot',
        show = checked ? 'dot' : 'default'

      fromTo(
        svg,
        {
          '--default-s': checked ? 1 : 0,
          '--default-x': checked ? '0px' : '8px',
          '--dot-s': checked ? 0 : 1,
          '--dot-x': checked ? '-8px' : '0px',
        },
        {
          ['--' + hide + '-s']: 0,
          ['--' + hide + '-x']: checked ? '8px' : '-8px',
          duration: 0.25,
          delay: 0.15,
        }
      )

      fromTo(
        input,
        {
          '--input-background': getCSSVar(checked ? '--c-default' : '--c-active'),
        },
        {
          '--input-background': getCSSVar(checked ? '--c-active' : '--c-default'),
          duration: 0.35,
          clearProps: true,
        }
      )

      to(svg, {
        keyframes: [
          {
            ['--' + show + '-x']: checked ? '2px' : '-2px',
            ['--' + show + '-s']: 1,
            duration: 0.25,
          },
          {
            ['--' + show + '-x']: '0px',
            duration: 0.2,
            clearProps: true,
          },
        ],
      })
    })
  })
}
