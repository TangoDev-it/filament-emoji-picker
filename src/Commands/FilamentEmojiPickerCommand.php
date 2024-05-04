<?php

namespace TangoDevIt\FilamentEmojiPicker\Commands;

use Illuminate\Console\Command;

class FilamentEmojiPickerCommand extends Command
{
    public $signature = 'filament-emoji-picker';

    public $description = 'My command';

    public function handle(): int
    {
        $this->comment('All done');

        return self::SUCCESS;
    }
}
