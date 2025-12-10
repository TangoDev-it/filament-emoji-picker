<?php

namespace TangoDevIt\FilamentEmojiPicker;

use Closure;
use Filament\Actions\Action;

class EmojiPickerAction extends Action
{
    protected string | Closure | null $popupPlacement = 'bottom-end';
    protected array | Closure | null $popupOffset = [7,4];

    public function popupPlacement(string | Closure $value): self
    {
        $this->popupPlacement = $value;
        return $this;
    }

    public function getPopupPlacement(): string
    {
        return (string) $this->evaluate($this->popupPlacement);
    }

    public function popupOffset(array | Closure $value): self
    {
        $this->popupOffset = $value;
        return $this;
    }

    public function getPopupOffset(): ?array
    {
        return (array) $this->evaluate($this->popupOffset);
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->label('');
        $this->icon('heroicon-o-face-smile');
        $this->alpineClickHandler('$event.stopPropagation(); $event.preventDefault(); toggle()');

        $this->extraAttributes([
            'class' => 'emoji-picker-button',
        ]);
    }

    public function isLivewireClickHandlerEnabled(): bool
    {
        return false;
    }

    protected function toIconButtonHtml(): string
    {
        $buttonHtml = parent::toIconButtonHtml();

        $statePath = $this->getSchemaComponent()?->getStatePath();
        $popupOffset = $this->getPopupOffset();
        $popupPlacement = $this->getPopupPlacement();
        $offsetX = $popupOffset[0];
        $offsetY = $popupOffset[1];

        return '<div x-data="{ state: $wire.$entangle(\'' . $statePath . '\'), open: false, pos: {top:0,left:0}, toggle() { const r=$el.getBoundingClientRect(); this.pos={top:r.bottom+5,left:r.left}; this.open=!this.open; } }" style="display:inline-flex;position:relative;">'
            . $buttonHtml
            . '<template x-teleport="body"><div x-show="open" x-cloak x-on:click.outside="open=false" :style="`z-index:9999;position:fixed;top:${pos.top}px;left:${pos.left}px;`"><emoji-picker x-on:emoji-click="state=(state??\'\')+$event.detail.unicode;open=false" :class="document.documentElement.classList.contains(\'dark\')?\'dark\':\'light\'"></emoji-picker></div></template>'
            . '</div>';
    }
}