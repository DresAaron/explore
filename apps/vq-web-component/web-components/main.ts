import { defineCustomElement } from './app';
import VQChat from './components/VQChat.ce.vue';

const VQChatElement = defineCustomElement(VQChat);
customElements.define('vq-chat', VQChatElement);
