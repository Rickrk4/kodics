<?php

namespace App;

class Constants
{
  public const READY      = 'ready';
  public const QUEUED     = 'queued';
  public const EXTRACTING = 'going';
  public const EXTRACTED  = 'finished';
  public const FAILED     = 'failed';
  public const JOB_STATES = [
    self::READY,
    self::EXTRACTING,
    self::EXTRACTED,
    self::FAILED,
    self::QUEUED,
  ];
}
