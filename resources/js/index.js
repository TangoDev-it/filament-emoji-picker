import { createPopper } from '@popperjs/core/lib/popper-lite';
import { Picker } from 'emoji-picker-element';
import it from 'emoji-picker-element/i18n/it';


function onEmojiPickerToggle(event) {
    const element = event.detail.element;
    const data = event.detail.data;
    if(data.initialized) return;

    const button = element.querySelector('.emoji-picker-button');
    const popup = element.querySelector('.emoji-picker-popup');

    const picker = new Picker({
        i18n: it,
        locale: 'it',
        dataSource: 'https://cdn.jsdelivr.net/npm/emoji-picker-element-data@1.6.0/it/cldr-native/data.json'
    });
    popup.appendChild(picker);

    createPopper(button, popup, {
        placement: 'bottom-end',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [7, 4],
                },
            },
        ],
    });

    data.initialized = true;
}

document.addEventListener('emoji-picker-toggle', onEmojiPickerToggle);