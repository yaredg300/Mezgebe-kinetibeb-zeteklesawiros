export const PRIMARY_FIREBASE_ADMIN_EMAIL = 'goferconstruction@gmail.com';
export const SUPER_ADMIN_EMAILS = [PRIMARY_FIREBASE_ADMIN_EMAIL] as const;

export function isMasterOperatorEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === PRIMARY_FIREBASE_ADMIN_EMAIL;
}

export function isSingleDepartmentLocked(params: {
  isMasterOperator: boolean;
  assignedDepartmentId: string | null | undefined;
  targetDepartmentId: string;
}): boolean {
  if (params.isMasterOperator) return false;
  if (!params.assignedDepartmentId) return false;
  return params.assignedDepartmentId !== params.targetDepartmentId;
}

export function getAuthErrorMessageAmharic(err: any): string {
  const code = err?.code || '';
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const host = typeof window !== 'undefined' ? window.location.hostname : '';

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    if (isInIframe) {
      return `የGoogle መግቢያ Pop-up መስኮቱ ተዘግቷል (${code})። በቅድመ-ዕይታ (iframe) ውስጥ አሳሹ Pop-up ከዘጋው፣ እባክዎ ከዚህ በታች «በአዲስ ትር ክፈት» የሚለውን ተጭነው በሙሉ ገጽ ይግቡ ወይም በኢሜይል ይግቡ።`;
    }
    return `የGoogle መግቢያ መስኮቱ ከመጠናቀቁ በፊት ተዘግቷል (${code})። እባክዎ እንደገና ይሞክሩ ወይም Pop-up መፈቀዱን ያረጋግጡ።`;
  }
  if (code === 'auth/unauthorized-domain') {
    return `ይህ ድረ-ገጽ (${host || 'domain'}) በ Firebase Authentication "Authorized domains" ዝርዝር ውስጥ አልተገኘም (auth/unauthorized-domain)። እባክዎ ያለ https:// ይህን ስም በትክክል መጨመሩን እና Google Sign-In መብራቱን ያረጋግጡ።`;
  }
  if (code === 'auth/popup-blocked') {
    return `የGoogle መግቢያ መስኮት በአሳሽዎ ታግዷል (auth/popup-blocked)። እባክዎ Pop-up ይፍቀዱ፣ ወይም አፑን በአዲስ ትር ከፍተው ይግቡ።`;
  }
  if (code === 'auth/operation-not-allowed') {
    return `በ Firebase Console > Authentication > Sign-in method ውስጥ የGoogle ወይም Email መግቢያ ገና አልበራም (auth/operation-not-allowed)።`;
  }
  if (code === 'auth/internal-error') {
    return `የFirebase መግቢያ ስህተት (auth/internal-error)። በ Firebase Console > Authentication > Sign-in method ውስጥ Google መብራቱን ያረጋግጡ ወይም አፑን በአዲስ ትር ከፍተው ይሞክሩ።`;
  }
  if (code === 'auth/network-request-failed') {
    return `የአውታረ-መረብ ግንኙነት ችግር (auth/network-request-failed)። እባክዎ ኢንተርኔትዎን ያረጋግጡና እንደገና ይሞክሩ።`;
  }
  if (code === 'auth/account-exists-with-different-credential') {
    return `ይህ ኢሜይል ቀድሞ በሌላ የመግቢያ ዘዴ ተመዝግቧል (auth/account-exists-with-different-credential)።`;
  }
  if (code === 'auth/email-already-in-use') {
    return 'ይህ የኢሜይል አድራሻ አስቀድሞ ተመዝግቧል። እባክዎ በቀጥታ «ግባ» የሚለውን ይምረጡ።';
  }
  if (code === 'auth/invalid-email') {
    return 'እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ።';
  }
  if (code === 'auth/weak-password') {
    return 'የይለፍ ቃል ቢያንስ 6 ፊደላት ወይም ቁጥሮች መሆን አለበት።';
  }
  if (
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found' ||
    code === 'auth/invalid-credential'
  ) {
    return 'የተሳሳተ ኢሜይል ወይም የይለፍ ቃል። እባክዎ እንደገና ይሞክሩ።';
  }
  if (code === 'auth/too-many-requests') {
    return 'ብዙ ሙከራዎች ተደርገዋል። እባክዎ ጥቂት ደቂቃዎች ቆይተው እንደገና ይሞክሩ።';
  }
  return `${err?.message || 'ያልታወቀ ስህተት አጋጥሟል።'}${code ? ` (${code})` : ''}`;
}
