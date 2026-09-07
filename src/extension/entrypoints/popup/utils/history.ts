import { browser } from 'wxt/browser';
import { getKeyHistory, privateHistory } from '@/utils/storage';

export let popupHistory = privateHistory;

export const initializePopupHistory = async () => {
  const window = await browser.windows.getCurrent();
  popupHistory = await getKeyHistory(window.incognito, window.id);
};
