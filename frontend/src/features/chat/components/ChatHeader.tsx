import { ActionIcon, Avatar, Badge, Box, Group, Indicator, Text } from '@mantine/core'
import { IconChevronLeft, IconDotsVertical, IconUser } from '@tabler/icons-react'
import React from 'react'

const ChatHeader = () => {
  return (
      <Group
           h={64}
           px={16}
           gap={10}
           bg="#fff"
           style={{
             borderBottom: '1px solid #FFE4E7',
             flexShrink: 0,
           }}
         >
           <ActionIcon
             variant="light"
             radius="xl"
             size={36}
             color="pink"
             aria-label="뒤로가기"
             styles={{
               root: {
                 border: '1.5px solid #FFE4E7',
                 backgroundColor: '#FFF0F2',
               },
             }}
           >
             <IconChevronLeft size={19} color="#E84D5C" />
           </ActionIcon>
   
           <Indicator
             color="green"
             size={11}
             offset={4}
             position="bottom-end"
             withBorder
           >
             <Avatar
               size={42}
               radius="xl"
               styles={{
                 root: {
                   background: 'linear-gradient(135deg, #FF8E9B, #E84D5C)',
                   boxShadow: '0 3px 10px rgba(255, 107, 122, 0.3)',
                 },
               }}
             >
               <IconUser size={24} color="white" />
             </Avatar>
           </Indicator>
   
           <Box style={{ flex: 1, minWidth: 0 }}>
             <Text size="sm" fw={700} c="#2D1A1E">
               ON.AI 도우미
             </Text>
   
             <Badge
               size="xs"
               radius="xl"
               color="green"
               variant="light"
               styles={{
                 root: {
                   border: '1px solid #A0E8BC',
                 },
               }}
             >
               온라인
             </Badge>
           </Box>
   
           <ActionIcon
             variant="subtle"
             radius="xl"
             size={36}
             color="pink"
             aria-label="더보기"
           >
             <IconDotsVertical size={19} color="#C4909A" />
           </ActionIcon>
         </Group>
   
  )
}

export default ChatHeader
