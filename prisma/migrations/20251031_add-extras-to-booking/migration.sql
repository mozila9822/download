-- Add optional JSON column `extras` to `Booking`
ALTER TABLE `Booking`
  ADD COLUMN `extras` JSON NULL;

