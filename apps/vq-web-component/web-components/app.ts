import {
  App,
  createApp,
  defineCustomElement as _defineCustomElement,
  Component,
  h,
  getCurrentInstance
} from 'vue';

import quasarIconSet from 'quasar/icon-set/material-icons-outlined';
import { Quasar } from 'quasar';

let virtualApp: App;

export function createVirtualApp() {
  if (!virtualApp) {
    virtualApp = createApp(undefined as any);

    virtualApp.use(Quasar, {
      iconSet: quasarIconSet,
      plugins: {},
      config: { extras: ['material-icons'] },
      importStrategy: 'auto',
      cssAddon: true
    } as any);
  }
  return virtualApp;
}

export function defineCustomElement(component: Component) {
  return _defineCustomElement({
    render: () => h(component),
    setup() {
      const instance = getCurrentInstance()!;
      const app = createVirtualApp();

      Object.assign(instance.appContext, app._context);
      // @ts-ignore
      Object.assign(instance.provides, app._context.provides);
    },

    styles: [...((component as any).styles ?? [])]
  });
}
