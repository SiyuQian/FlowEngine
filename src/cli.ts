#!/usr/bin/env node
import { cac } from 'cac';

const cli = cac('flow');

cli.version('0.1.0');
cli.help();

cli.parse();
