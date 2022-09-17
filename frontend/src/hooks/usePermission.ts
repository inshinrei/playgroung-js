import { useState, useEffect } from 'react'
import { off, on } from '../utils/dom'

type State = PermissionState | ''

interface PushPermissionDescriptor extends PermissionDescriptor {
  name: 'push'
  userVisibleOnly?: boolean
}

type IPermissionDescriptor = PermissionDescriptor | PushPermissionDescriptor

export function usePermission(permissionDesc: IPermissionDescriptor): State {
  const [state, setState] = useState<State>('')

  useEffect(() => {
    let mounted = true,
      permissionStatus: PermissionStatus | null = null

    function onChange() {
      if (!mounted) {
        return
      }

      setState(() => permissionStatus?.state ?? '')
    }

    navigator.permissions.query(permissionDesc).then(status => {
      permissionStatus = status

      on(permissionStatus, 'change', onChange)
      onChange()
    })

    return () => {
      permissionStatus && off(permissionStatus, 'change', onChange)
      mounted = false
      permissionStatus = null
    }
  }, [permissionDesc])

  return state
}
