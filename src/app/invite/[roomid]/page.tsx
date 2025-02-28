import InputUserName from '@/components/InputUserName';
import { supabase } from '@/lib/supabase';

type paramsProp = {
  params: {
    roomid: string;
  };
}

const InvitePage = async ({ params }: paramsProp) => {
  const { roomid } = await params;
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('room_id', roomid)
    .order('created_at', { ascending: true });
                  
  if (error) {
      console.error("ルームメンバー取得エラー", error);
      return;
  }
  
  const isFull = data.length >= 5 ? true : false;
  if (isFull) {
    return <div>部屋が満員です</div>;
  }

  return (
    <InputUserName mode="join" roomId={roomid} />
  );
}

export default InvitePage;