<div 
    x-load-js="[@js(\Filament\Support\Facades\FilamentAsset::getScriptSrc('filament-emoji-picker-scripts', package: 'tangodev-it/filament-emoji-picker'))]"
    x-init="$watch('open', value => $dispatch('emoji-picker-toggle', { element: $el, data: $data }))"
    x-data="{ 
        state: $wire.$entangle('{{ $getComponent()->getStatePath() }}'), 
        open: false, 
        toggle() { this.open = !this.open },
    }">
    @include ($childView)

    <div 
        class="emoji-picker-popup"
        style="z-index: 1000"
        data-popup-placement="{{ $getPopupPlacement() }}"
        data-popup-offset-x="{{ $popupOffsetX }}"
        data-popup-offset-y="{{ $popupOffsetY }}"
        x-on:click.outside="open = false"
        x-on:emoji-click="state = (state ?? '') + $event.detail.unicode"
        x-show="open">
    </div>
</div>