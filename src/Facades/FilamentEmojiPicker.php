<?php

namespace TangoDevIt\FilamentEmojiPicker\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @see \TangoDevIt\FilamentEmojiPicker\FilamentEmojiPicker
 */
class FilamentEmojiPicker extends Facade
{
    protected static function getFacadeAccessor()
    {
        return \TangoDevIt\FilamentEmojiPicker\FilamentEmojiPicker::class;
    }
}
