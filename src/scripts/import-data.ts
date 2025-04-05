import { createReadStream } from 'node:fs';
import { parse } from 'csv-parse';
import { supabase } from '../lib/supabase';

// CSVの型定義
interface DistilleryCSV {
  name: string;
  latitude: string;
  longitude: string;
  description: string;
  tours_available: string;
  tour_info: string;
}

interface BottleCSV {
  distillery_name: string;
  name: string;
  age_statement: string;
}

async function importDistilleries(filePath: string) {
  const records: DistilleryCSV[] = [];
  const parser = createReadStream(filePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
    })
  );

  for await (const record of parser) {
    records.push(record);
  }

  const { data: regions } = await supabase
    .from('regions')
    .select('id')
    .eq('name', 'Japan')
    .single();

  if (!regions) {
    console.error('日本のリージョンが見つかりません');
    return;
  }

  for (const record of records) {
    const { error } = await supabase.from('distilleries').insert({
      name: record.name,
      region_id: regions.id,
      latitude: parseFloat(record.latitude),
      longitude: parseFloat(record.longitude),
      description: record.description,
      tours_available: record.tours_available.toLowerCase() === 'true',
      tour_info: record.tour_info,
    });

    if (error) {
      console.error(`${record.name}の追加に失敗しました:`, error);
    } else {
      console.log(`${record.name}を追加しました`);
    }
  }
}

async function importBottles(filePath: string) {
  const records: BottleCSV[] = [];
  const parser = createReadStream(filePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
    })
  );

  for await (const record of parser) {
    records.push(record);
  }

  // 蒸留所名とIDのマッピングを取得
  const { data: distilleries } = await supabase
    .from('distilleries')
    .select('id, name');

  if (!distilleries) {
    console.error('蒸留所データの取得に失敗しました');
    return;
  }

  const distilleryMap = new Map(
    distilleries.map(d => [d.name, d.id])
  );

  for (const record of records) {
    const distilleryId = distilleryMap.get(record.distillery_name);
    if (!distilleryId) {
      console.error(`蒸留所が見つかりません: ${record.distillery_name}`);
      continue;
    }

    const { error } = await supabase.from('bottles').insert({
      name: record.name,
      age_statement: record.age_statement || null,
      distillery_id: distilleryId,
    });

    if (error) {
      console.error(`${record.name}の追加に失敗しました:`, error);
    } else {
      console.log(`${record.name}を追加しました`);
    }
  }
}

// コマンドライン引数の処理
const [,, command, filePath] = process.argv;

if (!command || !filePath) {
  console.error('使用方法: npm run import-data -- [distilleries|bottles] <ファイルパス>');
  process.exit(1);
}

switch (command) {
  case 'distilleries':
    importDistilleries(filePath).catch(console.error);
    break;
  case 'bottles':
    importBottles(filePath).catch(console.error);
    break;
  default:
    console.error('無効なコマンドです。"distilleries" または "bottles" を指定してください。');
    process.exit(1);
}