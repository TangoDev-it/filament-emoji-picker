<div 
    id="emoji-picker" 
    x-data
    x-on:click.outside="$event.target.closest('[x-bind=emojiPickerButton]') == null ? $store.emojiPicker.hide() : false"
    x-show="$store.emojiPicker.visible">
</div>
<script>
    document.addEventListener('alpine:init', () => {
        initEmojiPickerButtonBind();
        initEmojiPickerStore();

        // We avoid loading the emoji picker modules if there are no buttons in the page
        if(document.querySelectorAll('[x-bind=emojiPickerButton]').length == 0) return;
        initEmojiPicker();
    });

    document.addEventListener('emoji-picker-toggle', (event) => {
        const buttonId = event.detail.element.id;
        const dataProxy = event.detail.data;
        const store = Alpine.store('emojiPicker');
        store.toggle(buttonId, dataProxy);
    });

    document.addEventListener('emoji-click', (event) => {
        const unicode = event.detail.unicode;
        const store = Alpine.store('emojiPicker');
        store.appendEmoji(unicode);
    });

    function initEmojiPickerButtonBind() {
        Alpine.bind('emojiPickerButton', () => ({
            'x-on:click': '$dispatch("emoji-picker-toggle", { element: $el, data: $data })',
            'x-data': '{ state: $wire.entangle($el.dataset.statePath) }',
            ':id': '$id("emoji-picker-button")',
        }))
    }

    function initEmojiPickerStore() {
        Alpine.store('emojiPicker', {
            visible: false, // Whether the emoji picker is currently visible or not
            buttonId: null, // The id of the button that the emoji picker is attached to
            popperInstance: null, // The current PopperJs instance that is handling the emoji picker position
            dataProxy: null, // The AlpineJs data proxy, used to get a reference to the field to append the selected emoji to
            appendEmoji(unicode) {
                if(this.dataProxy == null) return;
                if(this.dataProxy.state == null) this.dataProxy.state = '';
                this.dataProxy.state += unicode;
            },
            toggle(buttonId, dataProxy) {
                if(this.visible) {
                    if(this.buttonId == buttonId) {
                        this.hide();
                    } else {
                        this.hide();
                        this.show(buttonId, dataProxy);
                    }
                } else {
                    this.show(buttonId, dataProxy);
                }
            },
            show(buttonId, dataProxy) {
                this.setEmojiPickerPosition(buttonId);
                this.buttonId = buttonId;
                this.dataProxy = dataProxy;
                this.visible = true;
            },
            hide() {
                this.visible = false;
                this.buttonId = null;
                this.dataProxy = null;
                if(this.popperInstance != null) this.popperInstance.destroy();
            },
            setEmojiPickerPosition(targetId) {
                var target = document.getElementById(targetId);
                var picker = document.getElementById('emoji-picker');

                if(this.popperInstance != null) this.popperInstance.destroy();
                this.popperInstance = emojiPickerModules.createPopper(target, picker, {
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
            }
        });
    }

    function loadEmojiPickerModules() {
        return Promise.all([
            import('https://cdn.jsdelivr.net/npm/emoji-picker-element@1.21.3/index.js'),
            import('https://cdn.jsdelivr.net/npm/emoji-picker-element@1.21.3/i18n/it.js'),
            import('https://unpkg.com/@popperjs/core@2.11.8/dist/esm/popper-lite.js')
        ]).then((modules) => {
            window.emojiPickerModules = {
                Picker: modules[0].Picker,
                i18n: modules[1].default,
                createPopper: modules[2].createPopper,
            }
        });
    }

    function initEmojiPicker() {
        return loadEmojiPickerModules().then(() => {
            const picker = new emojiPickerModules.Picker({
                i18n: emojiPickerModules.i18n,
                locale: 'it',
                dataSource: 'https://cdn.jsdelivr.net/npm/emoji-picker-element-data@1.6.0/it/cldr-native/data.json'
            });
            document.getElementById('emoji-picker').appendChild(picker);
        });
    }
</script>
