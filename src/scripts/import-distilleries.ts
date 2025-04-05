import { createReadStream } from 'node:fs';
import { parse } from 'csv-parse';
import { supabase } from '../lib/supabase';

// CSVの各行の型定義
interface DistilleryCSV {
  name: string;
  latitude: string;
  longitude: string;
  description: string;
  tours_available: string;
  tour_info: string;
}

async function importDistilleries(filePath: string) {
  const records: DistilleryCSV[] = [];

  // CSVを読み込む
  const parser = createReadStream(filePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
    })
  );

  for await (const record of parser) {
    records.push(record);
  }

  // 日本のリージョンIDを取得
  const { data: regions, error: regionError } = await supabase
    .from('regions')
    .select('id')
    .eq('name', 'Japan')
    .single();

  if (regionError) {
    console.error('リージョンの取得に失敗しました:', regionError);
    return;
  }

  // 蒸留所データを挿入
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

// スクリプトの実行
const csvPath = process.argv[2];
if (!csvPath) {
  console.error('CSVファイルのパスを指定してください');
  process.exit(1);
}

importDistilleries(csvPath).catch(console.error);