#!/bin/sh
set -eu
npx prisma db push
exec npx next start -p 3000
