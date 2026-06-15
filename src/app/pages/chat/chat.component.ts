import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SharedModule } from '../../shared/shared.module';

interface LinkedItem {
  title: string;
  price: string;
  imageUrl?: string;
  productId?: string | number;
}

interface ChatUser {
  id: number;
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  linkedItem?: LinkedItem;
  // raw fields from API
  senderEmail?: string;
  receiverEmail?: string;
  productId?: string | number;
}

interface ChatMessage {
  id: string;
  text: string;
  time: string;
  isMe: boolean;
  file?: {
    name: string;
    url: SafeUrl;
    isImage: boolean;
    isAudio?: boolean;
    isPlaying?: boolean;
    duration?: number;
    currentTime?: number;
    progress?: number;
  };
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  textComposerPayload: string = '';
  searchQuery: string = '';
  isRecordingVoice: boolean = false;

  isConversationSelected: boolean = false;
  activeUnsendDropdownId: string | null = null;

  // Web Audio Recording Pipeline
  private audioContext: AudioContext | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private leftAudioBuffers: Float32Array[] = [];
  private totalBufferLength: number = 0;
  private localStreamReference: MediaStream | null = null;

  recordingDuration: number = 0;
  private durationInterval: any;
  private pollInterval: any;

  conversationsList: ChatUser[] = [];
  activeChannelUser: ChatUser = { id: 0, name: '', subtitle: '' };
  chatLogs: ChatMessage[] = [];
  isLoadingChats: boolean = true;

  currentProductId: string | number | undefined;

  private currentUserEmail: string = '';
  private activeReceiverEmail: string = '';

  contextualChips: string[] = [
    'Hello!',
    'Is it available?',
    'Can you share more details?',
    'When did you buy this?',
    'What is the condition of the product?',
    'Request for call'
  ];

  constructor(
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserEmail = localStorage.getItem('email') || '';

    this.route.queryParamMap.subscribe(params => {
      const receiverEmail = params.get('receiverEmail') || '';
      const receiverName = params.get('receiverName') || '';
      const prodId = params.get('productId');
      if (prodId) {
        this.currentProductId = prodId;
      }
      if (receiverEmail && this.currentUserEmail) {
        this.openConversationForReceiver(receiverEmail, receiverName || receiverEmail);
      }
    });

    if (this.currentUserEmail) {
      this.loadChatList();
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.pollInterval);
    clearInterval(this.durationInterval);
  }

  // ─── Chat List ──────────────────────────────────────────────────────────────

  private loadChatList(): void {
    this.apiService.getUserChats(this.currentUserEmail).subscribe({
      next: (data: any[]) => {
        const groups = new Map<string, any>();
        (data || []).forEach(c => {
          const senderEmail = c.senderEmail || c.sender;
          const receiverEmail = c.receiverEmail || c.receiver;
          const otherEmail =
            senderEmail === this.currentUserEmail ? receiverEmail : senderEmail;
          if (!otherEmail) return;

          const existing = groups.get(otherEmail);
          if (!existing) {
            groups.set(otherEmail, c);
          } else {
            const newTime = c.messageTime ? new Date(c.messageTime).getTime() : (c.timestamp ? new Date(c.timestamp).getTime() : 0);
            const existingTime = existing.messageTime ? new Date(existing.messageTime).getTime() : (existing.timestamp ? new Date(existing.timestamp).getTime() : 0);
            if (newTime >= existingTime) {
              groups.set(otherEmail, c);
            }
          }
        });

        const sortedConvs = Array.from(groups.entries()).map(([otherEmail, c], idx) => {
          const time = c.messageTime ? new Date(c.messageTime).getTime() : (c.timestamp ? new Date(c.timestamp).getTime() : 0);
          return {
            id: idx + 1,
            name: otherEmail, // Default to email initially
            subtitle: c.lastMessage || c.message || '',
            avatarUrl: undefined,
            senderEmail: this.currentUserEmail,
            receiverEmail: otherEmail,
            productId: c.productId,
            timestamp: time
          } as ChatUser & { timestamp: number };
        });

        sortedConvs.sort((a, b) => b.timestamp - a.timestamp);

        this.conversationsList = sortedConvs;
        this.cdr.detectChanges();

        this.conversationsList.forEach(user => {
          const otherEmail = user.receiverEmail;
          if (otherEmail) {
            this.apiService.getSellerProfile(otherEmail).subscribe({
              next: (profile) => {
                if (profile) {
                  user.name = profile.name || otherEmail;
                  user.avatarUrl = profile.profileImage || undefined;
                  this.cdr.detectChanges();
                }
              },
              error: (err) => {
                console.error(`Failed to load profile for ${otherEmail}:`, err);
              }
            });
          }
        });
        
        this.isLoadingChats = false;
      },
      error: (err: any) => {
        console.error('Failed to load chat list:', err);
        this.isLoadingChats = false;
      }
    });
  }

  // ─── Conversation Selection ─────────────────────────────────────────────────

  selectConversation(user: ChatUser): void {
    this.activeChannelUser = user;
    this.isConversationSelected = true;
    this.activeReceiverEmail = user.receiverEmail || user.name;
    this.currentProductId = user.productId;
    this.activeChannelUser.linkedItem = undefined;

    clearInterval(this.pollInterval);
    this.loadMessages();
    this.apiService.markSeen(this.activeReceiverEmail).subscribe({ error: () => {} });

    // Poll for new messages every 5 s
    this.pollInterval = setInterval(() => this.loadMessages(), 5000);
  }

  private openConversationForReceiver(receiverEmail: string, receiverName: string): void {
    this.activeReceiverEmail = receiverEmail;
    this.activeChannelUser = {
      id: 0,
      name: receiverName,
      receiverEmail,
      senderEmail: this.currentUserEmail,
      productId: this.currentProductId
    };
    this.isConversationSelected = true;
    this.activeChannelUser.linkedItem = undefined;

    // Fetch user details for conversation header
    this.apiService.getSellerProfile(receiverEmail).subscribe({
      next: (profile) => {
        if (profile) {
          this.activeChannelUser.name = profile.name || receiverEmail;
          this.activeChannelUser.avatarUrl = profile.profileImage || undefined;
          this.cdr.detectChanges();
        }
      }
    });

    clearInterval(this.pollInterval);
    this.loadMessages();
    this.apiService.markSeen(this.activeReceiverEmail).subscribe({ error: () => {} });

    this.pollInterval = setInterval(() => this.loadMessages(), 5000);
  }

  private loadMessages(): void {
    if (!this.activeReceiverEmail) return;
    this.apiService.getConversation(this.currentUserEmail, this.activeReceiverEmail).subscribe({
      next: (data: any[]) => {
        // Scrape for a productId in the conversation messages if we don't have one
        if (!this.currentProductId && data && data.length > 0) {
          const firstMsgWithProduct = data.find(m => m.productId);
          if (firstMsgWithProduct) {
            this.currentProductId = firstMsgWithProduct.productId;
          }
        }

        // Load product details if we have currentProductId but no linkedItem yet
        if (this.currentProductId && (!this.activeChannelUser.linkedItem || this.activeChannelUser.linkedItem.productId !== this.currentProductId)) {
          const prodIdStr = String(this.currentProductId);
          this.apiService.getProductById(prodIdStr).subscribe({
            next: (prod) => {
              if (prod) {
                this.activeChannelUser.linkedItem = {
                  title: prod.name,
                  price: prod.price ? String(prod.price) : '',
                  imageUrl: prod.image,
                  productId: prod.id
                };
                this.cdr.detectChanges();
              }
            },
            error: (err) => console.error('Failed to fetch product for chat header:', err)
          });
        }

        this.chatLogs = (data || []).map((m: any) => {
          const time = m.messageTime
            ? new Date(m.messageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : (m.timestamp
              ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '');
          const isMe = (m.senderEmail || m.sender) === this.currentUserEmail;
          const msg: ChatMessage = {
            id: m.id ? String(m.id) : this.generateMessageId(),
            text: m.message ?? m.content ?? '',
            time,
            isMe
          };

          const attachmentUrl = m.attachmentUrl || m.fileUrl;
          const voiceUrl = m.voiceUrl;
          const fileUrl = attachmentUrl || voiceUrl;
          if (fileUrl) {
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(fileUrl);
            const isImage = attachmentUrl ? /\.(png|jpg|jpeg|gif|webp)$/i.test(fileUrl) : false;
            const isAudio = !!voiceUrl || /\.(mp3|wav|ogg|m4a)$/i.test(fileUrl);
            msg.file = {
              name: attachmentUrl ? (m.fileName || 'Attachment') : 'Voice Message',
              url: safeUrl,
              isImage,
              isAudio,
              isPlaying: false,
              duration: 0,
              currentTime: 0,
              progress: 0
            };
          }
          return msg;
        });
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: (err: any) => console.error('Failed to load messages:', err)
    });
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  getUserInitial(name: string): string {
    if (!name) return '';
    return name.trim().charAt(0).toUpperCase();
  }

  private generateMessageId(): string {
    return 'msg_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  onSearchChange(): void {
    console.log('Search text updated:', this.searchQuery);
  }

  viewProductDetail(item: LinkedItem | undefined): void {
    if (item && item.productId) {
      this.router.navigate(['/product', item.productId]);
    }
  }

  // ─── WAV Encoder Text ──────────────────────────────────────────────────────────────

  _dispatchMessage(): void {
    if (this.isRecordingVoice) {
      this.stopAudioRecording();
      return;
    }
    if (!this.textComposerPayload.trim()) return;

    const text = this.textComposerPayload.trim();
    this.textComposerPayload = '';

    // Optimistic UI
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.chatLogs.push({ id: this.generateMessageId(), text, time: currentTime, isMe: true });
    this.scrollToBottom();

    if (this.activeReceiverEmail) {
      this.apiService.sendMessage({
        senderEmail: this.currentUserEmail,
        receiverEmail: this.activeReceiverEmail,
        message: text,
        productId: this.currentProductId
      }).subscribe({
        next: () => this.loadMessages(),
        error: (err: any) => console.error('Send failed:', err)
      });
    }
  }

  injectChipValue(chipValue: string): void {
    this.textComposerPayload = chipValue;
    this._dispatchMessage();
  }

  unsendMessage(targetMessage: ChatMessage): void {
    const isOptimistic = targetMessage.id.startsWith('msg_');
    this.chatLogs = this.chatLogs.filter(msg => msg.id !== targetMessage.id);
    this.cdr.detectChanges();

    if (!isOptimistic && this.currentUserEmail) {
      this.apiService.unsendMessage(targetMessage.id, this.currentUserEmail).subscribe({
        next: () => {
          this.loadMessages();
        },
        error: (err: any) => {
          console.error('Unsend failed:', err);
        }
      });
    }
  }

  // ─── File Attachment ────────────────────────────────────────────────────────

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (!fileList || fileList.length === 0) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    Array.from(fileList).forEach(file => {
      const rawUrl = URL.createObjectURL(file);
      const safeFileUrl = this.sanitizer.bypassSecurityTrustUrl(rawUrl);
      const isImageFile = file.type.startsWith('image/');

      // Optimistic UI
      this.chatLogs.push({
        id: this.generateMessageId(),
        text: isImageFile ? '' : `Sent an attachment: ${file.name}`,
        time: currentTime,
        isMe: true,
        file: { name: file.name, url: safeFileUrl, isImage: isImageFile, isAudio: false }
      });

      // Upload via API
      if (this.activeReceiverEmail) {
        this.apiService.uploadAttachment(file).subscribe({
          next: (res: any) => {
            const fileUrl = res?.url || res?.fileUrl || (typeof res === 'string' ? res : '');
            if (fileUrl) {
              this.apiService.sendMessage({
                senderEmail: this.currentUserEmail,
                receiverEmail: this.activeReceiverEmail,
                content: isImageFile ? '' : `Sent an attachment: ${file.name}`,
                attachmentUrl: fileUrl,
                fileName: file.name,
                productId: this.currentProductId
              }).subscribe({ next: () => this.loadMessages(), error: () => {} });
            }
          },
          error: (err: any) => console.error('Attachment upload failed:', err)
        });
      }
    });

    this.scrollToBottom();
    element.value = '';
  }

  // ─── Voice Recording ────────────────────────────────────────────────────────

  toggleVoiceDictation(): void {
    if (this.isRecordingVoice) {
      this.stopAudioRecording();
    } else {
      this.startAudioRecording();
    }
  }

  private startAudioRecording(): void {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.localStreamReference = stream;
        this.leftAudioBuffers = [];
        this.totalBufferLength = 0;
        this.recordingDuration = 0;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
        this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
        this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

        this.scriptProcessor.onaudioprocess = (e) => {
          if (!this.isRecordingVoice) return;
          const inputData = e.inputBuffer.getChannelData(0);
          this.leftAudioBuffers.push(new Float32Array(inputData));
          this.totalBufferLength += inputData.length;
        };

        this.mediaStreamSource.connect(this.scriptProcessor);
        this.scriptProcessor.connect(this.audioContext.destination);
        this.isRecordingVoice = true;

        this.durationInterval = setInterval(() => {
          this.recordingDuration++;
          this.cdr.detectChanges();
        }, 1000);
      })
      .catch(error => {
        console.error('Microphone access denied:', error);
        alert('Could not access microphone.');
      });
  }

  private stopAudioRecording(): void {
    if (!this.isRecordingVoice) return;
    this.isRecordingVoice = false;
    clearInterval(this.durationInterval);

    if (this.scriptProcessor) this.scriptProcessor.disconnect();
    if (this.mediaStreamSource) this.mediaStreamSource.disconnect();
    if (this.localStreamReference) {
      this.localStreamReference.getTracks().forEach(track => track.stop());
    }

    const sampleRate = this.audioContext ? this.audioContext.sampleRate : 44100;
    if (this.audioContext) this.audioContext.close();

    const flattenedBuffer = new Float32Array(this.totalBufferLength);
    let offset = 0;
    for (const buf of this.leftAudioBuffers) {
      flattenedBuffer.set(buf, offset);
      offset += buf.length;
    }

    const wavBuffer = this.encodeWAV(flattenedBuffer, sampleRate);
    const audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
    const rawAudioUrl = URL.createObjectURL(audioBlob);
    const safeAudioUrl = this.sanitizer.bypassSecurityTrustUrl(rawAudioUrl);
    const capturedDuration = this.recordingDuration;

    // Show in UI immediately
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.chatLogs.push({
      id: this.generateMessageId(),
      text: '',
      time: currentTime,
      isMe: true,
      file: {
        name: 'Voice Note',
        url: safeAudioUrl,
        isImage: false,
        isAudio: true,
        isPlaying: false,
        duration: capturedDuration > 0 ? capturedDuration : 0,
        currentTime: 0,
        progress: 0
      }
    });
    this.scrollToBottom();
    this.cdr.detectChanges();

    // Upload to backend
    if (this.activeReceiverEmail) {
      const wavFile = new File([audioBlob], 'voice-note.wav', { type: 'audio/wav' });
      this.apiService.uploadVoice(wavFile).subscribe({
        next: (res: any) => {
          const voiceUrl = res?.voiceUrl || res?.url || res?.fileUrl || (typeof res === 'string' ? res : '');
          if (voiceUrl) {
            this.apiService.sendMessage({
              senderEmail: this.currentUserEmail,
              receiverEmail: this.activeReceiverEmail,
              message: '',
              voiceUrl,
              fileName: 'Voice Note',
              productId: this.currentProductId
            }).subscribe({ next: () => this.loadMessages(), error: () => {} });
          }
        },
        error: (err: any) => console.error('Voice upload failed:', err)
      });
    }
  }

  discardAudioRecording(): void {
    if (!this.isRecordingVoice) return;
    this.isRecordingVoice = false;
    clearInterval(this.durationInterval);

    if (this.scriptProcessor) this.scriptProcessor.disconnect();
    if (this.mediaStreamSource) this.mediaStreamSource.disconnect();
    if (this.localStreamReference) {
      this.localStreamReference.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) this.audioContext.close();

    this.leftAudioBuffers = [];
    this.totalBufferLength = 0;
    this.recordingDuration = 0;
    this.cdr.detectChanges();
  }

  // ─── Audio Playback ─────────────────────────────────────────────────────────

  initAudioDuration(fileObj: any, nativeAudio: HTMLAudioElement): void {
    if (nativeAudio.duration && isFinite(nativeAudio.duration) && (!fileObj.duration || fileObj.duration === 0)) {
      fileObj.duration = Math.round(nativeAudio.duration);
      this.cdr.detectChanges();
    }
  }

  togglePlayback(fileObj: any, nativeAudio: HTMLAudioElement): void {
    if (fileObj.isPlaying) {
      nativeAudio.pause();
      fileObj.isPlaying = false;
    } else {
      nativeAudio.play();
      fileObj.isPlaying = true;
    }
    this.cdr.detectChanges();
  }

  onAudioTimeUpdate(fileObj: any, nativeAudio: HTMLAudioElement): void {
    fileObj.currentTime = nativeAudio.currentTime;
    if (nativeAudio.duration && isFinite(nativeAudio.duration) && (!fileObj.duration || fileObj.duration === 0)) {
      fileObj.duration = nativeAudio.duration;
    }
    fileObj.progress = fileObj.duration > 0 ? (nativeAudio.currentTime / fileObj.duration) * 100 : 0;
    this.cdr.detectChanges();
  }

  onAudioTrackEnded(fileObj: any): void {
    fileObj.isPlaying = false;
    fileObj.currentTime = 0;
    fileObj.progress = 0;
    this.cdr.detectChanges();
  }

  getAudioCountdownDisplay(fileObj: any): string {
    const total = fileObj.duration || 0;
    const current = fileObj.currentTime || 0;
    const remaining = Math.max(0, Math.ceil(total - current));
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  getFormattedDuration(): string {
    const m = Math.floor(this.recordingDuration / 60);
    const s = this.recordingDuration % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // ─── WAV Encoder ────────────────────────────────────────────────────────────

  private encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    let index = 44;
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      index += 2;
    }
    return buffer;
  }

  private writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = document.querySelector('.overflow-y-auto');
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}