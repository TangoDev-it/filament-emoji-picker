<div 
    x-init="$watch('open', value => $dispatch('emoji-picker-toggle', { element: $el, data: $data }))"
    x-data="{ 
        state: $wire.$entangle('{{ $statePath }}'), 
        open: false, 
        initialized : false, 
        toggle() { this.open = !this.open },
    }">
    @include ($childView)

    <div 
        class="emoji-picker-popup"
        x-on:click.outside="open = false"
        x-on:emoji-click="state = (state ?? '') + $event.detail.unicode"
        x-show="open">
    </div>
</div>