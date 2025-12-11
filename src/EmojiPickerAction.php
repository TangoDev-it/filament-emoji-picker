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
        $this->label('Emoji');
        $this->icon('heroicon-o-face-smile');
        $this->alpineClickHandler('toggle');
        $this->extraAttributes([
            'class' => 'emoji-picker-button',
        ]);
    }

    public function isLivewireClickHandlerEnabled(): bool
    {
        return false;
    }

    public function toHtml(): string
    {
        $popupOffset = $this->getPopupOffset();
        $viewData = [
            'childView' => parent::toHtml(),
            'popupPlacement' => $this->getPopupPlacement(),
            'popupOffsetX' => $popupOffset[0],
            'popupOffsetY' => $popupOffset[1],
            'statePath' => $this->getSchemaComponent()->getStatePath()
        ];
        return view('filament-emoji-picker::emoji-picker-action', $viewData)->render();
    }
    
}