"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import useRoomStore from "@/store/roomStore";
import usePlayerStore from "@/store/playerStore"
import { useRouter } from "next/navigation";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "名前は2文字以上で入力してください",
  }).max(10, {
    message: "名前は１０文字以下で入力してください",
  }),
})

type Prop =  {
    mode: string,
    roomId: string,
};

const InputUserName = (props: Prop) => {
  const { createRoom, setRoomId } = useRoomStore();
  const { createPlayer, setIsLoading, setIsRoomMaster } = usePlayerStore();
  const router = useRouter();
  

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  const onSubmitCreate = async (values: z.infer<typeof formSchema>) => {
    if (values.username.trim() == "") return;

    setIsLoading(true);
    await createRoom();
    const roomId = useRoomStore.getState().roomId;
    if (!roomId) return;
    await createPlayer(values.username, roomId)
    setIsRoomMaster(true);
    router.push(`/room/${roomId}`);
  }

  const onSubmitJoin = async (values: z.infer<typeof formSchema>) => {
    if (values.username.trim() == "") return;

    setIsLoading(true);
    if (!props.roomId) return;
    setRoomId(props.roomId);
    createPlayer(values.username, props.roomId);
    setIsRoomMaster(false);
    router.push(`/room/${props.roomId}`);
  }

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(props.mode == "create" ? onSubmitCreate : onSubmitJoin)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ユーザー名</FormLabel>
                <FormControl>
                  <Input placeholder="ユーザー名を入力してください" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-3">開始</Button>
        </form>
      </Form>
    </div>
  );
}

export default InputUserName