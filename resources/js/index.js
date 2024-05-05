import { createPopper } from '@popperjs/core';
import { Picker } from 'emoji-picker-element';

function isDarkTheme() {
    return document.documentElement.classList.contains('dark');
}

async function onEmojiPickerToggle(event) {
    const element = event.detail.element;
    const data = event.detail.data;
    const button = element.querySelector('.emoji-picker-button');
    const popup = element.querySelector('.emoji-picker-popup');

    if(data.initialized) {
        // If the popup was already initialized, we only toggle the light/dark class based on the current theme
        const picker = popup.querySelector('emoji-picker');
        picker.classList.remove('dark', 'light');
        picker.classList.add(isDarkTheme() ? 'dark' : 'light');
        return;
    };

    const i18n = await import(window.filamentData.emojiPicker.i18n);

    const picker = new Picker({
        i18n: i18n.default,
        locale: window.filamentData.emojiPicker.locale,
        dataSource: window.filamentData.emojiPicker.datasource
    });

    // We set the light/dark class based on the current theme
    picker.classList.add(isDarkTheme() ? 'dark' : 'light');
    popup.appendChild(picker);

    createPopper(button, popup, {
        placement: popup.dataset.popupPlacement,
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [
                        parseInt(popup.dataset.popupOffsetX), 
                        parseInt(popup.dataset.popupOffsetY)
                    ],
                },
            },
        ],
    });

    data.initialized = true;
}

document.addEventListener('emoji-picker-toggle', onEmojiPickerToggle);