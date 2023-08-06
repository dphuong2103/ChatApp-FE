export const Gender = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
} as const

export type GenderType = keyof typeof Gender;
export type RelationshipStatus = "NotFriend" | "RequestSent" | "RequestReceived" | "Friend" | "Unknown";
export type User = {
  id: string;
  displayName: string;
  email: string;
  accessToken?: string;
  photoUrl?: string | null;
  bio?: string | null;
  gender?: GenderType | null;
  dateOfBirth?: string | null;
};

export enum ChatRoomType {
  ONE = 'ONE',
  MANY = 'MANY'
}

export type UserRelationship = {
  id: string;
  initiatorUserId: string;
  initiatorUser?: User;
  targetUserId: string;
  targetUser?: User;
  relationshipType: 'E_FRIEND' | 'E_BLOCK';
  status: 'E_ACCEPTED' | 'E_DECLINED' | 'E_PENDING';
  updatedTime: Date;
  createdTime: Date;
};
export type NewUserRelationship = Omit<UserRelationship, 'id' | 'initiatorUser' | 'targetUser' | 'createdTime' | 'updatedTime'>

export type ChatRoom = {
  id: string;
  name?: string;
  chatRoomType: 'ONE' | 'MANY';
  creator: User;
  creatorId: string;
  isDeleted: boolean;
  photoUrl?: string;
};
export type NewChatRoom = Omit<ChatRoom, 'id' | 'isDeleted' | 'creator' | 'photoUrl'>
export type AddMembersToChatGroup = {
  chatRoomId: string,
  userIds: string[]
}

export type SignInUser = {
  name: string;
  email: string;
};

export type ChatRoomInfo = {
  name: string;
  imgUrl?: string | null;
  partners: User[];
}

export type LoginInUser = SignInUser;

export type ChatRoomSummary = {
  latestMessage?: Message;
  users: User[],
  numberOfUnreadMessages?: number;
  userChatRoom: UserChatRoom;
  chatRoom: ChatRoom;
}

export type NewChat = {
  users: User[],
}


export type UserChatRoom = {
  id: string;
  userId: string;
  user?: User;
  chatRoomId: string;
  chatRoom: ChatRoom;
  createdTime: Date;
  lastMessageReadId?: string;
  lastMessageRead?: Message;
  isMuted?: boolean;
  memberShipStatus?: 'Active' | 'Kicked' | 'Left';
}

export type UpdateLastMessageRead = Pick<UserChatRoom, 'id' | 'lastMessageReadId'>;
export type SetMutedDTO = Pick<UserChatRoom, 'id' | 'isMuted'>;
export type RemoveFromGroupChat = {
  userId: string;
  chatRoomId: string;
}

export type Message = {
  id: string;
  messageText: string;
  senderId: string;
  sender: User;
  chatRoomId: string;
  chatRoom: ChatRoom;
  replyToMessageId?: string;
  replyToMessage?: Message;
  createdTime: Date;
  isDeleted: boolean
}

export type MessageRead = {
  messageId: string;
  message: Message;
  userId: string;
  User: User;
}


export type NewMessage = Omit<Message, 'id' | 'createdTime' | 'chatRoom' | 'createdTime' | 'isDeleted' | 'sender' | 'replyToMessage'>;

export type ContextChildren = {
  children: React.ReactNode
}

export type NewChatRoomAndUserList = {
  newChatRoom: NewChatRoom,
  userIds: string[]
}
export enum MessagesActionType {
  FIRSTGET,
  UPSERTORDELETEMESSAGE,
  DELETEALL,
  GETLIST
}

export enum ConnectionFunction {
  ReceivedChatRoom = 'ReceivedChatroom',
  ReceivedMessage = 'receivedmessage',
  ReceiveCall = 'ReceiveCall',
  UpdateConnectionId = 'updateconnectionid',
  CallAccepted = 'callaccepted',
  CallDeclined = 'calldeclined',
  LeavedCall = 'leavedcall',
  ReceivedRelationship = 'receivedrelationship',
}


export enum ChatRoomSummaryConnectionFunction {
  RemoveUserFromGroupChat = 'removeuserfromgroupchat',
  AddMembersToChatRoom = 'addmemberstochatroom',
  UpdateChatRoomName = 'updatechatroomname',
}

export enum ChatRoomSummaryActionType {
  FIRSTGET,
  UPSERT,
  UPDATELATESTMESSAGE,
  USERTUSERCHATROOM,
  RemoveUserFromGroupChat,
  AddMembersToChatRoom,
  UpdateChatRoomName,
  DeleteAll,
  UpdateUnReadMessageCountOnChatRoomOpen,
  UpdateChatRoomSMROnReceiveMessage,
  UpdateUser
}

export type ChatRoomIdAndUsers = {
  chatRoomId: string,
  users: User[]
}

export type ChatRoomIdAndUserId = {
  userId: string,
  chatRoomId: string
}
export type ChatRoomIdAndName = {
  chatRoomId: string
  name: string,
}

export type CallStatus = {
  calling: boolean,
  receivingCall: boolean,
  onCall: boolean,
}


export enum InvokeServerFunction {
  CloseChatRoom = 'CloseChatRoom',
  OpenChatRoom = 'OpenChatRoom',
  UserOnline = 'UserOnline',
  InitiateCall = 'InitiateCall',
  AcceptCall = 'AcceptCall',
  DeclinedCall = 'DeclinedCall',
  LeaveCall = 'LeaveCall',
}

export enum CallType {
  VIDEOCALL = 'VIDEOCALL',
  AUDIOCALL = 'AUDIOCALL',
}

export type Friend = {
  user: User,
  chatRoomSummary?: ChatRoomSummary,
}

export type UserWithRelationship = {
  user: User,
  relationship?: UserRelationship
}