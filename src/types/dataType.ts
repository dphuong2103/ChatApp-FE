import { StorageError } from 'firebase/storage';

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
  photoUrl?: string | null;
};
export type NewChatRoom = Omit<ChatRoom, 'id' | 'isDeleted' | 'creator' | 'photoUrl'>
export type AddMembersToChatGroup = {
  chatRoomId: string,
  userIds: string[]
}

export type ChatRoomIdAndImageUrl = {
  chatRoomId: string,
  photoUrl: string
}

export type SignInUser = {
  name: string;
  email: string;
};

export type ChatRoomInfo = {
  name: string;
  imgUrl?: string | null;
  partners: User[];
  relationship?: UserRelationship,
  relationshipStatus?: RelationshipStatus
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
  senderId: string;
  sender: User;
  chatRoomId: string;
  chatRoom: ChatRoom;
  createdTime: Date;
  isDeleted: boolean;
  messageText: string;
  replyToMessageId?: string;
  replyToMessage?: Message;
} & ({
  type: 'PlainText'
} | ({
  type: 'Files',
} & ({
  fileStatus: 'InProgress',
  files: File,
  fileName: string,
  uploadTask?: UploadTask
} | {
  fileStatus: 'Cancelled',
  fileName: string
} | {
  fileStatus: 'Done',
  fileUrls: string;
  fileName: string
} | {
  fileStatus: 'Error',
  fileName: string
}
  )
  ) | ({
    type: 'AudioRecord'
  } & ({
    fileStatus: 'InProgress',
    audio: Blob,
    uploadTask?: UploadTask

  } | {
    fileStatus: 'Done',
    fileUrls: string;
  } | {
    fileStatus: 'Error',
    fileName: string
  })
  )
  )

export type NewMessage = Pick<Message, 'senderId' | 'chatRoomId' | 'replyToMessageId' | 'messageText'>
export type NewMessageForFileUpload = Pick<Message & {
  fileName: string
}, 'senderId' | 'chatRoomId' | 'replyToMessageId' | 'messageText' | 'fileName'>

export type NewMessageForAudioRecord = Pick<Message, 'senderId' | 'chatRoomId'>;

export type MessageRead = {
  messageId: string;
  message: Message;
  userId: string;
  User: User;
}

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
  GETLIST,
  CancelUploadingMessageFile,
  GetMissingMessages
}

export enum ConnectionFunction {
  ReceivedChatRoomSummary = 'ReceivedChatRoomSummary',
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
  ReceivedChatRoom = 'receivedchatroom'
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
  UpdateUser,
  UpdateChatRoom
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

export type UploadTask = {
  messageId: string,
  cancelTask: () => void,
  subscribe: (callback: (uploadStatus: UploadFileStatus) => void) => () => void,
  file: File | Blob
}

export type UploadFileStatus = {
  progress: number,
  error?: StorageError | null,
}