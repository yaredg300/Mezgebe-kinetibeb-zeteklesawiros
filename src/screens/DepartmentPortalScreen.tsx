import React, { useState } from 'react';
import {
  Palette,
  CalendarDays,
  BookOpen,
  Music,
  Users,
  Megaphone,
  HandCoins,
  Plus,
  Layers,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle,
  FileText,
  Phone,
  Search,
  Filter,
  X,
  ExternalLink,
  Shield,
  UserCheck,
  Calendar,
  AlertCircle,
  ArrowLeftRight,
  TrendingUp,
  Award,
  ClipboardList,
  Target,
  BarChart3,
  Bookmark,
  CheckCircle2,
  FolderOpen,
  Send,
  HelpCircle,
} from 'lucide-react';
import { useArchive } from '../context/ArchiveContext';
import { SundaySchoolDepartment, DepartmentInfo } from '../types';
import { HaragDivider, ManuscriptBox } from '../components/Ornaments';
import { AppHeader } from '../components/AppHeader';

interface DepartmentPortalScreenProps {
  departmentId: SundaySchoolDepartment;
  onOpenDepartmentsHub: () => void;
  onSwitchToKinetibeb: () => void;
  onSwitchToEhudMerhaGibir: () => void;
  onNavigateToArchive?: () => void;
  onNavigateToSearch?: () => void;
  onNavigateToEvents?: () => void;
  onNavigateToProfile?: () => void;
}

// 1. Dashboard KPI & Metric Model
interface DepartmentKPI {
  id: string;
  label: string;
  value: string;
  subtext: string;
  change: string;
  trend: 'up' | 'neutral';
  color: string;
  iconName: string;
}

interface DepartmentGoal {
  id: string;
  title: string;
  progressPercent: number;
  currentAmharic: string;
  targetAmharic: string;
  statusText: string;
}

// 2. Canonical Responsibility Model
interface DepartmentResponsibility {
  id: string;
  title: string;
  category: 'ቀኖናዊ' | 'አስተዳደራዊ' | 'ትምህርታዊ' | 'ማህበራዊ' | 'ቴክኒካዊ';
  cycle: 'ዕለታዊ' | 'ሳምንታዊ' | 'ወርሃዊ' | 'ዓመታዊ';
  leadOfficer: string;
  description: string;
  objectives: string[];
  isMandatory: boolean;
}

// 3. Duty Assignment Model
interface DepartmentAssignment {
  id: string;
  title: string;
  assigneeName: string;
  spiritualTitle: string;
  dutyType: string;
  scheduleAmharic: string;
  targetGroup: string;
  status: 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED';
  phone: string;
  notes: string;
}

// 4. Operational Task Model
interface DepartmentTask {
  id: string;
  title: string;
  dateAmharic: string;
  timeAmharic: string;
  assignedTo: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'HIGH' | 'MEDIUM' | 'NORMAL';
  description: string;
}

// 5. Document Model
interface DepartmentDocument {
  id: string;
  title: string;
  category: string;
  fileType: string;
  dateAmharic: string;
  author: string;
  sizeAmharic: string;
  description: string;
}

// 6. Minute Model
interface DepartmentMinute {
  id: string;
  title: string;
  dateAmharic: string;
  attendeesCount: number;
  chairPerson: string;
  decisions: string[];
}

export const DepartmentPortalScreen: React.FC<DepartmentPortalScreenProps> = ({
  departmentId,
  onOpenDepartmentsHub,
  onSwitchToKinetibeb,
  onSwitchToEhudMerhaGibir,
  onNavigateToArchive,
  onNavigateToSearch,
  onNavigateToEvents,
  onNavigateToProfile,
}) => {
  const { departmentsList, members, addMember, setActiveDepartment } = useArchive();

  // Find info about current department
  const currentDept: DepartmentInfo =
    departmentsList.find((d) => d.id === departmentId) || {
      id: departmentId,
      titleAmharic: 'የሰንበት ትምህርት ቤት አገልግሎት ክፍል',
      subtitleAmharic: 'የደብረ መድኃኒት ተክለ ሣዊሮስ ሰንበት ት/ቤት',
      shortTitleAmharic: 'አገልግሎት ክፍል',
      iconName: 'Layers',
      badgeLabel: 'ክፍል',
      descriptionAmharic: 'በሰንበት ትምህርት ቤቱ መዋቅር ስር ራሱን ችሎ የሚሰራ አገልግሎት ክፍል',
      accentColor: '#0C4A9E',
      status: 'ACTIVE',
      coordinatorName: 'የክፍሉ አስተባባሪ',
      memberCount: 16,
      programsCount: 8,
    };

  // Sub-tabs in the department workspace
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'RESPONSIBILITIES' | 'ASSIGNMENTS' | 'TASKS' | 'DOCS' | 'MINUTES'
  >('DASHBOARD');

  // Filter / Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  // Modals
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showAddMinuteModal, setShowAddMinuteModal] = useState(false);

  // ----------------------------------------------------
  // REALISTIC DEPARTMENT DATA BY CHURCH BRANCH
  // ----------------------------------------------------

  // 1. Live KPI metrics
  const getDepartmentKPIs = (): DepartmentKPI[] => {
    if (departmentId === 'education') {
      return [
        {
          id: 'kpi_1',
          label: 'የስርዓተ-ትምህርት ሽፋን',
          value: '84.5%',
          subtext: 'ከታቀዱት 48 ሞጁሎች ውስጥ',
          change: '+4.2% በዚህ ወር',
          trend: 'up',
          color: '#16A34A',
          iconName: 'BookOpen',
        },
        {
          id: 'kpi_2',
          label: 'የመምህራን መገኘት ምጣኔ',
          value: '96.2%',
          subtext: 'ሳምንታዊ የመማር ማስተማር',
          change: '+1.5% ተሻሽሏል',
          trend: 'up',
          color: '#0C4A9E',
          iconName: 'UserCheck',
        },
        {
          id: 'kpi_3',
          label: 'አማካይ የፈተና ውጤት',
          value: '78.4 / 100',
          subtext: 'የ፩ኛ መንፈቅ ዓመት ምዘና',
          change: 'በ 420 ተማሪዎች',
          trend: 'up',
          color: '#B88500',
          iconName: 'Award',
        },
        {
          id: 'kpi_4',
          label: 'ንቁ የክፍል ደረጃዎች',
          value: '12 ክፍሎች',
          subtext: 'ከሕፃናት እስከ አበው',
          change: 'ሙሉ ሳምንታዊ ስምሪት',
          trend: 'neutral',
          color: '#9333EA',
          iconName: 'Layers',
        },
      ];
    }

    if (departmentId === 'mezmur') {
      return [
        {
          id: 'kpi_1',
          label: 'የተጠናኑ መዝሙራት ካታሎግ',
          value: '142 መዝሙራት',
          subtext: 'የቅዱስ ያሬድ ዜማና ስንኝ',
          change: '+8 አዳዲስ መዝሙራት',
          trend: 'up',
          color: '#9333EA',
          iconName: 'Music',
        },
        {
          id: 'kpi_2',
          label: 'የልምምድ ሳምንታዊ ተሳትፎ',
          value: '91.8%',
          subtext: 'የወጣቶችና ሕፃናት መዘምራን',
          change: '+3.1% ከፍተኛ ተሳትፎ',
          trend: 'up',
          color: '#16A34A',
          iconName: 'Users',
        },
        {
          id: 'kpi_3',
          label: 'ዝግጁ የበዓል ዝማሬዎች',
          value: '18 መዝሙራት',
          subtext: 'ለበዓለ ሃምሳና ንግስ በዓላት',
          change: 'ሙሉ ዝግጅት ተጠናቋል',
          trend: 'up',
          color: '#B88500',
          iconName: 'CheckCircle',
        },
        {
          id: 'kpi_4',
          label: 'የበገናና መሰንቆ ተማሪዎች',
          value: '34 ተማሪዎች',
          subtext: 'የቅዱሳት መሳሪያዎች ጥናት',
          change: 'ሳምንታዊ ቅዳሜ',
          trend: 'neutral',
          color: '#0C4A9E',
          iconName: 'Sparkles',
        },
      ];
    }

    if (departmentId === 'records') {
      return [
        {
          id: 'kpi_1',
          label: 'የተመዘገቡ ጠቅላላ ተማሪዎች',
          value: '486 አባላት',
          subtext: 'በዲጂታል ዳታቤዝ የተመዘገቡ',
          change: '+32 አዲስ በዚህ ሴሚስተር',
          trend: 'up',
          color: '#D97706',
          iconName: 'Users',
        },
        {
          id: 'kpi_2',
          label: 'ያለፈው እሑድ የተገኙ',
          value: '412 ተማሪዎች',
          subtext: '84.8% የመገኘት ምጣኔ',
          change: 'የ 12 ክፍሎች ኦዲት',
          trend: 'up',
          color: '#16A34A',
          iconName: 'CheckCircle',
        },
        {
          id: 'kpi_3',
          label: 'የተሰጡ አዲስ መታወቂያዎች',
          value: '52 መታወቂያዎች',
          subtext: 'ባለባርኮድ የሰንበት ት/ቤት ካርድ',
          change: '100% የታደሰ',
          trend: 'up',
          color: '#0C4A9E',
          iconName: 'Award',
        },
        {
          id: 'kpi_4',
          label: 'የስነ-ስርዓትና ምክረ-አበው',
          value: '14 ጉዳዮች',
          subtext: 'የቀረቡና የተፈቱ ክትትሎች',
          change: 'ሙሉ ስምምነት ተገኝቷል',
          trend: 'neutral',
          color: '#B88500',
          iconName: 'Shield',
        },
      ];
    }

    if (departmentId === 'media') {
      return [
        {
          id: 'kpi_1',
          label: 'ሳምንታዊ የተደራሽነት ምጣኔ',
          value: '4,280 ምዕመናን',
          subtext: 'በቴሌግራም፣ ዩቲዩብና በህትመት',
          change: '+14% የተደራሽነት እድገት',
          trend: 'up',
          color: '#0284C7',
          iconName: 'Megaphone',
        },
        {
          id: 'kpi_2',
          label: 'የታተሙ ሳምንታዊ ማስታወቂያዎች',
          value: '38 እትሞች',
          subtext: 'የሰንበት ጉባኤ ቃለ-አዋዲ',
          change: 'በየእሑዱ ተሰራጭቷል',
          trend: 'up',
          color: '#16A34A',
          iconName: 'FileText',
        },
        {
          id: 'kpi_3',
          label: 'የቀጥታ ስርጭትና ቪዲዮ ማህደር',
          value: '126 ሰነዶች',
          subtext: 'የበዓላት፣ ጉባኤያትና ስብከቶች',
          change: 'HD ቪዲዮና ኦዲዮ',
          trend: 'up',
          color: '#9333EA',
          iconName: 'Clock',
        },
        {
          id: 'kpi_4',
          label: 'ንቁ የዲጂታል ተከታዮች',
          value: '2,150 አባላት',
          subtext: 'የተክለ ሣዊሮስ ይፋዊ ቻናል',
          change: '+85 አዳዲስ በዚህ ሳምንት',
          trend: 'up',
          color: '#B88500',
          iconName: 'TrendingUp',
        },
      ];
    }

    if (departmentId === 'finance') {
      return [
        {
          id: 'kpi_1',
          label: 'የወሩ የተሰበሰበ ገቢ',
          value: '142,850 ብር',
          subtext: 'ከቋሚ መዋጮና በጎ አድራጎት',
          change: '+18,200 ብር ከባለፈው ወር',
          trend: 'up',
          color: '#059669',
          iconName: 'HandCoins',
        },
        {
          id: 'kpi_2',
          label: 'የዓመታዊ በጀት አፈፃፀም',
          value: '68.5%',
          subtext: 'ከታቀደው 500,000 ብር ግብ',
          change: 'በ 6 ወራት ውስጥ የተመዘገበ',
          trend: 'up',
          color: '#0C4A9E',
          iconName: 'Target',
        },
        {
          id: 'kpi_3',
          label: 'ንቁ የልማት ፕሮጀክቶች',
          value: '3 ፕሮጀክቶች',
          subtext: 'የሕፃናት ማዕከልና አዳራሽ እድሳት',
          change: 'በሂደት ላይ ያሉ',
          trend: 'neutral',
          color: '#B88500',
          iconName: 'Layers',
        },
        {
          id: 'kpi_4',
          label: 'የተደገፉ አቅመ-ደካማ ተማሪዎች',
          value: '24 ተማሪዎች',
          subtext: 'የደብተር፣ ልብስና የት/ቤት ድጋፍ',
          change: '100% የተሸፈነ',
          trend: 'up',
          color: '#9333EA',
          iconName: 'Award',
        },
      ];
    }

    // Default / Custom department KPIs
    return [
      {
        id: 'kpi_1',
        label: 'የዕቅድ አፈፃፀም ምጣኔ',
        value: '76.8%',
        subtext: 'ከሩብ ዓመቱ ዋና ዋና ግቦች',
        change: '+5.4% መሻሻል',
        trend: 'up',
        color: currentDept.accentColor || '#0C4A9E',
        iconName: 'TrendingUp',
      },
      {
        id: 'kpi_2',
        label: 'ንቁ አገልጋዮች',
        value: `${currentDept.memberCount || 14} አባላት`,
        subtext: 'በክፍሉ ስር የተመደቡ',
        change: 'ሙሉ ሳምንታዊ ተሳትፎ',
        trend: 'up',
        color: '#16A34A',
        iconName: 'Users',
      },
      {
        id: 'kpi_3',
        label: 'የተከናወኑ ተግባራት',
        value: `${currentDept.programsCount || 10} ተግባራት`,
        subtext: 'የተጠናቀቁና በሂደት ያሉ',
        change: 'በወቅቱ የተከናወነ',
        trend: 'up',
        color: '#B88500',
        iconName: 'CheckCircle',
      },
      {
        id: 'kpi_4',
        label: 'የክፍሉ አጠቃላይ አቋም',
        value: 'በጣም ጥሩ (A)',
        subtext: 'በሰንበት ት/ቤት ስራ አስፈፃሚ',
        change: 'ቀጣይ ግምገማ የካቲት ፴',
        trend: 'neutral',
        color: '#9333EA',
        iconName: 'Shield',
      },
    ];
  };

  // 2. Department Core Goals & Progress
  const getDepartmentGoals = (): DepartmentGoal[] => {
    if (departmentId === 'education') {
      return [
        {
          id: 'g_1',
          title: 'የነገረ ሃይማኖትና የመጽሐፍ ቅዱስ ሞጁሎችን ለሁሉም ደረጃዎች ማጠናቀቅ',
          progressPercent: 88,
          currentAmharic: '42 ሞጁሎች',
          targetAmharic: '48 ሞጁሎች',
          statusText: 'በማጠናቀቅ ላይ',
        },
        {
          id: 'g_2',
          title: 'የመምህራን የማስተማር ክህሎትና የስነ-ዘዴ ስልጠና ማካሄድ',
          progressPercent: 100,
          currentAmharic: '18 መምህራን',
          targetAmharic: '18 መምህራን',
          statusText: 'ተጠናቋል ✓',
        },
        {
          id: 'g_3',
          title: 'የ፩ኛ መንፈቅ ዓመት የፈተና ውጤቶች ትንተናና ሪፖርት ካርድ',
          progressPercent: 72,
          currentAmharic: '320 ተማሪዎች',
          targetAmharic: '420 ተማሪዎች',
          statusText: 'በሂደት ላይ',
        },
      ];
    }

    if (departmentId === 'mezmur') {
      return [
        {
          id: 'g_1',
          title: 'የበዓለ ሃምሳና የትንሣኤ መዝሙራትን ለወጣቶችና ሕፃናት ማስተማር',
          progressPercent: 92,
          currentAmharic: '24 መዝሙራት',
          targetAmharic: '26 መዝሙራት',
          statusText: 'ዝግጁ ነው',
        },
        {
          id: 'g_2',
          title: 'የበገናና መሰንቆ ዜማ መሳሪያዎች ልምምድ ክፍል ማስፋፋት',
          progressPercent: 78,
          currentAmharic: '34 ተማሪዎች',
          targetAmharic: '40 ተማሪዎች',
          statusText: 'በስልጠና ላይ',
        },
      ];
    }

    return [
      {
        id: 'g_1',
        title: `${currentDept.titleAmharic} ዓመታዊ የ2019 ዓ.ም የስራ እቅድ ማስፈጸም`,
        progressPercent: 82,
        currentAmharic: '8 ተግባራት',
        targetAmharic: '10 ተግባራት',
        statusText: 'በመልካም አፈፃፀም ላይ',
      },
      {
        id: 'g_2',
        title: 'የክፍሉ አገልጋዮች ወርሃዊ የግምገማ ጉባኤያትን ማካሄድ',
        progressPercent: 100,
        currentAmharic: '6 ስብሰባዎች',
        targetAmharic: '6 ስብሰባዎች',
        statusText: 'ተጠናቋል ✓',
      },
    ];
  };

  // 3. Department Canonical Responsibilities in the Sunday School Charter
  const getDepartmentResponsibilities = (): DepartmentResponsibility[] => {
    if (departmentId === 'education') {
      return [
        {
          id: 'resp_ed1',
          title: 'የስርዓተ ትምህርት ቀረጻና የሞጁሎች ዝግጅት',
          category: 'ትምህርታዊ',
          cycle: 'ዓመታዊ',
          leadOfficer: 'መምህር ኤርምያስ በላይ (የክፍል ኃላፊ)',
          description:
            'የኦርቶዶክስ ተዋሕዶ እምነት ቀኖና፣ ዶግማና ትውፊት ሳይዛባ ለሕፃናት፣ ለማዕከላውያን፣ ለወጣቶችና ለአበው የሚመጥኑ የነገረ ሃይማኖት፣ የስርዓተ ቤተክርስቲያን፣ የታሪክና የመጽሐፍ ቅዱስ ሞጁሎችን ማዘጋጀትና ማረጋገጥ።',
          objectives: [
            'የእምነት ቀኖና ንጽህናን በየደረጃው ማስተማር',
            'ዕድሜን ያማከሉ የመማሪያ መጻሕፍትና ማስታወሻዎችን ማሳተም',
            'የግዕዝ ቋንቋና ሰዋስው መሠረታዊ እውቀትን ማዳረስ',
          ],
          isMandatory: true,
        },
        {
          id: 'resp_ed2',
          title: 'የመምህራን ስምሪት፣ ስልጠናና ክትትል',
          category: 'አስተዳደራዊ',
          cycle: 'ሳምንታዊ',
          leadOfficer: 'ዲ/ን አማኑኤል (ምክትል ኃላፊ)',
          description:
            'በሰንበት ትምህርት ቤቱ መማሪያ ክፍሎች ሳምንታዊ የመምህራን ድልድል ማውጣት፣ መምህራን በሰዓቱ ተገኝተው ትምህርቱን እንዲሰጡ መከታተልና የስነ-ዘዴ ስልጠናዎችን ማዘጋጀት።',
          objectives: [
            'ሳምንታዊ 100% የመምህራን የመማሪያ ክፍል ሽፋን ማረጋገጥ',
            'የመምህራን የመማሪያ እቅድ (Lesson Plan) በየሳምንቱ መገምገም',
            'ተተኪ መምህራንን ከመድረክ ተማሪዎች መመልመልና ማሰልጠን',
          ],
          isMandatory: true,
        },
        {
          id: 'resp_ed3',
          title: 'የፈተናዎች ዝግጅት፣ ውጤት አሰጣጥና ምረቃ',
          category: 'ትምህርታዊ',
          cycle: 'ወርሃዊ',
          leadOfficer: 'የፈተናና ምዘና ኮሚቴ',
          description:
            'የመንፈቅ ዓመትና የዓመት መጨረሻ ፈተናዎችን በምስጢር ማዘጋጀት፣ ተማሪዎችን በስነ-ስርዓት መፈተን፣ ውጤት መመዝገብ፣ ደረጃ ማውጣትና የላቀ ውጤት ላመጡ ተማሪዎች ሽልማት ማዘጋጀት።',
          objectives: [
            'ፍትሃዊና ተዓማኒነት ያለው የፈተና ስርዓት ማቋቋም',
            'የተማሪዎች የትምህርት አቀባበል ድክመት ካለ ለይቶ የማካካሻ ትምህርት መስጠት',
            'ዓመታዊ የምርቃትና የማዕረግ ሽልማት ማስተባበር',
          ],
          isMandatory: true,
        },
        {
          id: 'resp_ed4',
          title: 'የመንፈሳዊ ንባብና የቤተ-መጻሕፍት አገልግሎት',
          category: 'ማህበራዊ',
          cycle: 'ዕለታዊ',
          leadOfficer: 'የቤተ-መጻሕፍት አስተዳዳሪ',
          description:
            'የሰንበት ት/ቤቱን የብራና፣ የታተሙ የሃይማኖት መጻሕፍትና የማጣቀሻ ሰነዶች መጠበቅ፣ ለተማሪዎች በብድር ማሰራጨትና የንባብ ክበብ ማካሄድ።',
          objectives: [
            'የተማሪዎችን የመንፈሳዊ ንባብ ባህል ማሳደግ',
            'ጥንታዊ የቤተክርስቲያን መጻሕፍትን ዲጂታላይዝ ማድረግ',
          ],
          isMandatory: false,
        },
      ];
    }

    if (departmentId === 'mezmur') {
      return [
        {
          id: 'resp_mz1',
          title: 'የቅዱስ ያሬድ ዜማዎችና መንፈሳዊ መዝሙራት ስልጠና',
          category: 'ቀኖናዊ',
          cycle: 'ሳምንታዊ',
          leadOfficer: 'ሊቀ መዘምራን ገብረ ማርያም (ዋና አሰልጣኝ)',
          description:
            'የቅዱስ ያሬድ ሦስቱን ዜማዎች (ግዕዝ፣ ዕዝል፣ አራራይ) እና የሰንበት ትምህርት ቤት ወጥ መዝሙራትን ለሕፃናት፣ ለማዕከላውያንና ለወጣቶች በስነ-ስርዓት ማሰልጠን።',
          objectives: [
            'የጥንታዊውን ያሬዳዊ ዜማ ማንነት ጠብቆ ማቆየት',
            'የድምፅ ጥራትና የስንኝ አወቃቀር ስልጠና መስጠት',
          ],
          isMandatory: true,
        },
        {
          id: 'resp_mz2',
          title: 'የቅዱሳት ዜማ መሳሪያዎች ስልጠና (በገና፣ መሰንቆ፣ ከበሮ)',
          category: 'ትምህርታዊ',
          cycle: 'ሳምንታዊ',
          leadOfficer: 'ዲ/ን ቴዎድሮስ አማረ',
          description:
            'በዳዊት በገናና በመሰንቆ ዜማ ማቅረብ ለሚፈልጉ ተማሪዎች የቅኝት፣ የጣት አቀማመጥና የዜማ መሳሪያዎች ስልጠና መስጠት።',
          objectives: [
            'የበገና ዜማ ተተኪዎችን ማፍራት',
            'የጽናጽልና ከበሮ አመታት ስነ-ስርዓት ማስተማር',
          ],
          isMandatory: true,
        },
        {
          id: 'resp_mz3',
          title: 'የበዓላትና የሰንበት መድረክ መዘምራን ድልድል',
          category: 'አስተዳደራዊ',
          cycle: 'ሳምንታዊ',
          leadOfficer: 'የዜማ አስተባባሪ ኮሚቴ',
          description:
            'በየሰንበቱና በንግስ በዓላት በመድረክ ላይ የሚዘምሩ ቡድኖችን መመደብ፣ አልባሳትን መቆጣጠርና የመዘምራን ስነ-ምግባርን መጠበቅ።',
          objectives: [
            'ክብረ በዓላትን በደመቀ መንፈሳዊ ዝማሬ ማክበር',
            'የመዘምራን አንድነትና ስርዓት የተጠበቀ እንዲሆን ማድረግ',
          ],
          isMandatory: true,
        },
      ];
    }

    if (departmentId === 'records') {
      return [
        {
          id: 'resp_rc1',
          title: 'የአባላትና የተማሪዎች ምዝገባ፣ ቆጠራና ዲጂታል ዳታቤዝ',
          category: 'አስተዳደራዊ',
          cycle: 'ዕለታዊ',
          leadOfficer: 'አቶ ሃብታሙ ወርቁ (ዋና ተቆጣጣሪ)',
          description:
            'የተክለ ሣዊሮስ ሰንበት ት/ቤት ተማሪዎችን ከሕፃናት እስከ አበው ሙሉ መረጃ፣ አድራሻ፣ የወላጆች ስልክና የትምህርት ክፍል በዲጂታል መዝገብ ማደራጀት።',
          objectives: [
            '100% ትክክለኛ የተማሪዎች ዳታቤዝ መያዝ',
            'የተማሪዎች ቁጥር እድገትን በየሩብ ዓመቱ መገምገም',
          ],
          isMandatory: true,
        },
        {
          id: 'resp_rc2',
          title: 'ሳምንታዊ የመገኘት ሰሌዳ ኦዲትና የደብተር ቁጥጥር',
          category: 'አስተዳደራዊ',
          cycle: 'ሳምንታዊ',
          leadOfficer: 'ወ/ሪት ሰላማዊት ታደሰ',
          description:
            'በየሰንበቱ በሁሉም ክፍሎች የሚገኙ ተቆጣጣሪዎች የመገኘት መዝገብ ሰብስበው ያረጋገጡትን መረጃ መመዝገብ፣ ተደጋጋሚ ቀሪዎችን ለይቶ ከወላጆች ጋር መነጋገር።',
          objectives: [
            'የተማሪዎች የመቅረት ምጣኔን ከ 10% በታች ማውረድ',
            'የቤት ስራና የደብተር አያያዝን መቆጣጠር',
          ],
          isMandatory: true,
        },
        {
          id: 'resp_rc3',
          title: 'የአባልነት መታወቂያ ካርድ ዝግጅትና የሽኝት ደብዳቤ',
          category: 'አስተዳደራዊ',
          cycle: 'ወርሃዊ',
          leadOfficer: 'የካርድና ሰነድ ኦፊሰር',
          description:
            'ለአዳዲስ ተማሪዎች ባርኮድ ያለው መታወቂያ ማዘጋጀት፣ አባልነታቸውን ለሚቀይሩ ወይም ወደ ዩኒቨርሲቲ ለሚሄዱ አባላት የሽኝት ደብዳቤ ማዘጋጀት።',
          objectives: [
            'የአባላት ደህንነትና ይፋዊ መታወቂያ ማረጋገጥ',
            'የአባልነት ዝውውር ስርዓት ማጠናከር',
          ],
          isMandatory: true,
        },
      ];
    }

    if (departmentId === 'media') {
      return [
        {
          id: 'resp_md1',
          title: 'ሳምንታዊ የሰንበት ጉባኤ ማስታወቂያዎችና ህትመት',
          category: 'ማህበራዊ',
          cycle: 'ሳምንታዊ',
          leadOfficer: 'ዲ/ን አማኑኤል ተስፋዬ (ሚዲያ ኃላፊ)',
          description:
            'የሰንበት ት/ቤቱን ሳምንታዊ የትምህርት፣ ዝማሬና የበዓላት ማስታወቂያዎች አዘጋጅቶ በመድረክ ማሰማትና በህትመት ለምዕመናን ማሰራጨት።',
          objectives: [
            'ወቅታዊ መረጃን በፍጥነት ለምዕመናን ማድረስ',
            'የሰንበት ት/ቤቱን ሳምንታዊ መልእክት ማስተላለፍ',
          ],
          isMandatory: true,
        },
        {
          id: 'resp_md2',
          title: 'የቀጥታ ስርጭት፣ ፎቶና ቪዲዮ ሰነዶች ማጠናቀር',
          category: 'ቴክኒካዊ',
          cycle: 'ሳምንታዊ',
          leadOfficer: 'ዮናስ ብርሃኑ (ቪዲዮ መሪ)',
          description:
            'የበዓላትን ዝግጅቶች፣ የኪነጥበብ ተውኔቶችንና የስብከተ ወንጌል ጉባኤያትን በከፍተኛ ጥራት መቅረጽና በማህበራዊ ገጾች ማሰራጨት።',
          objectives: [
            'የሰንበት ት/ቤቱን ታሪክ በዲጂታል ቪዲዮ ማስቀረት',
            'በውጭ አገር ለሚኖሩ የሰንበት ት/ቤት አባላት ጉባኤውን ማድረስ',
          ],
          isMandatory: true,
        },
      ];
    }

    if (departmentId === 'finance') {
      return [
        {
          id: 'resp_fn1',
          title: 'የሰንበት ት/ቤት የልማት ፕሮጀክቶች እቅድና በጀት አፈፃፀም',
          category: 'አስተዳደራዊ',
          cycle: 'ዓመታዊ',
          leadOfficer: 'አቶ ተክለ ሃይማኖት ካሳ (የልማት ሰብሳቢ)',
          description:
            'የሰንበት ት/ቤቱን የክፍሎች እድሳት፣ የድምፅና ሚዲያ እቃዎች ግዢ እንዲሁም የሕንፃ ማስፋፊያ ፕሮጀክቶችን ማቀድና በጀታቸውን መቆጣጠር።',
          objectives: [
            'የሰንበት ት/ቤቱን የቁሳቁስና የመማሪያ አቅም ማሳደግ',
            'ዘመናዊና የተመቻቸ የመማሪያ አካባቢ መፍጠር',
          ],
          isMandatory: true,
        },
        {
          id: 'resp_fn2',
          title: 'የወርሃዊ መዋጮ፣ ባዛርና የገቢ ማሰባሰቢያ ማስተባበር',
          category: 'ማህበራዊ',
          cycle: 'ወርሃዊ',
          leadOfficer: 'ወ/ሮ ብርቱካን አለሙ (ገንዘብ ያዥ)',
          description:
            'ከአባላትና ደጋፊ ምዕመናን ወርሃዊ መዋጮ መሰብሰብ፣ የደረሰኝ ቁጥጥር ማካሄድና በበዓላት ወቅት መንፈሳዊ የገበያ ዝግጅቶችን ማዘጋጀት።',
          objectives: [
            'ግልጽና ተዓማኒነት ያለው የሂሳብ አያያዝ መዘርጋት',
            'የሰንበት ት/ቤቱን ራስን በራስ የማስተዳደር አቅም ማሳደግ',
          ],
          isMandatory: true,
        },
        {
          id: 'resp_fn3',
          title: 'የበጎ አድራጎትና የአቅመ-ደካማ ተማሪዎች ድጋፍ',
          category: 'ማህበራዊ',
          cycle: 'ወርሃዊ',
          leadOfficer: 'ዲ/ን ዮሴፍ (የበጎ አድራጎት አስተባባሪ)',
          description:
            'አቅም የሌላቸውን ተማሪዎች የትምህርት ቤት ደብተር፣ የደንብ ልብስና የትራንስፖርት ወጪ በመሸፈን ትምህርታቸውን እንዳያቋርጡ ማድረግ።',
          objectives: [
            'የክርስቲያናዊ ፍቅርን በተግባር መግለጥ',
            'አንድም ተማሪ በድህነት ምክንያት እንዳይቀር መደገፍ',
          ],
          isMandatory: true,
        },
      ];
    }

    // Default / Custom department responsibilities
    return [
      {
        id: 'resp_gen1',
        title: `${currentDept.titleAmharic} ቀኖናዊና አስተዳደራዊ ተልእኮ ማስፈጸም`,
        category: 'አስተዳደራዊ',
        cycle: 'ሳምንታዊ',
        leadOfficer: currentDept.coordinatorName || 'የክፍሉ አስተባባሪ',
        description: `${currentDept.titleAmharic} በደብረ መድኃኒት ተክለ ሣዊሮስ ሰንበት ትምህርት ቤት መዋቅር ስር የተሰጠውን ተልእኮ በላቀ ቅንዓት ማከናወንና ለሥራ አስፈፃሚው ሪፖርት ማቅረብ።`,
        objectives: [
          'የክፍሉን አባላት ማስተባበርና ሳምንታዊ መርሐ ግብራትን በሰዓቱ ማካሄድ',
          'የሰንበት ት/ቤቱን አንድነትና ስርዓት መጠበቅ',
        ],
        isMandatory: true,
      },
      {
        id: 'resp_gen2',
        title: 'የአባላት ስምሪትና የክፍሉ ንብረት አያያዝ',
        category: 'ቴክኒካዊ',
        cycle: 'ወርሃዊ',
        leadOfficer: 'የክፍሉ ንብረት ተቆጣጣሪ',
        description: 'በክፍሉ ስር የሚገኙ ሰነዶች፣ መዝገቦችና የቢሮ ቁሳቁሶችን በአግባቡ መጠበቅና አባላትን በተገቢው የስራ ዘርፍ መመደብ።',
        objectives: ['የክፍሉን ሀብት በአግባቡ መጠቀም', 'የስራ ቅልጥፍናን ማሳደግ'],
        isMandatory: true,
      },
    ];
  };

  // 4. Department Duty Assignments
  const [assignments, setAssignments] = useState<DepartmentAssignment[]>(() => {
    try {
      const saved = localStorage.getItem(`mezgebe_dept_assignments_${departmentId}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }

    if (departmentId === 'education') {
      return [
        {
          id: 'asgn_ed1',
          title: 'የነገረ ሃይማኖትና የስርዓት መምህር',
          assigneeName: 'መምህር ኤርምያስ በላይ',
          spiritualTitle: 'መምህረ ወንጌል',
          dutyType: 'የክፍል ኃላፊና ዋና መምህር',
          scheduleAmharic: 'እሑድ ጠዋት ፪:፴ - ፫:፴',
          targetGroup: 'የሕፃናትና ማዕከላውያን ደረጃ ፩',
          status: 'ACTIVE',
          phone: '0911-23-45-67',
          notes: 'የቅድስት ሥላሴ ምስጢርና የተዋሕዶ እምነት መሠረቶችን ማስተማር',
        },
        {
          id: 'asgn_ed2',
          title: 'የመጽሐፍ ቅዱስ ጥናት መሪ',
          assigneeName: 'ዲ/ን አማኑኤል ተስፋዬ',
          spiritualTitle: 'ዲያቆን',
          dutyType: 'የጥናት መሪ',
          scheduleAmharic: 'ቅዳሜ ከቀኑ ፱:00 - ፲:፴',
          targetGroup: 'የወጣቶች ክፍል',
          status: 'ACTIVE',
          phone: '0922-34-56-78',
          notes: 'የኦሪት ዘፍጥረትና የወንጌላት ትንታኔ ማስተባበር',
        },
        {
          id: 'asgn_ed3',
          title: 'የሕፃናት መንፈሳዊ ታሪክና ስነ-ምግባር',
          assigneeName: 'ወ/ሮ ዘውዲቱ ካሳ',
          spiritualTitle: 'መምህርት',
          dutyType: 'የሕፃናት መምህርት',
          scheduleAmharic: 'እሑድ ከቀኑ ፬:00 - ፭:00',
          targetGroup: 'የሙዓለ ሕፃናት',
          status: 'ACTIVE',
          phone: '0933-45-67-89',
          notes: 'በቀለማትና በስዕል የታገዘ የመጽሐፍ ቅዱስ ጀግኖች ታሪክ',
        },
        {
          id: 'asgn_ed4',
          title: 'የግዕዝ ቋንቋና ሰዋስው መምህር',
          assigneeName: 'መ/ር ዮሐንስ ግርማ',
          spiritualTitle: 'የግዕዝ መምህር',
          dutyType: 'የቋንቋ አሰልጣኝ',
          scheduleAmharic: 'ቅዳሜ ከሰዓት ፯:00 - ፰:፴',
          targetGroup: 'ማዕከላውያንና ወጣቶች',
          status: 'IN_PROGRESS',
          phone: '0944-56-78-90',
          notes: 'የግዕዝ ፊደላት፣ ቁጥሮችና መሠረታዊ ሰዋስው ማስተማር',
        },
      ];
    }

    if (departmentId === 'mezmur') {
      return [
        {
          id: 'asgn_mz1',
          title: 'የወጣቶች መዘምራን ዋና አሰልጣኝ',
          assigneeName: 'ሊቀ መዘምራን ገብረ ማርያም',
          spiritualTitle: 'ሊቀ መዘምራን',
          dutyType: 'ዋና የዜማ መሪ',
          scheduleAmharic: 'ቅዳሜ ከቀኑ ፰:00 - ፲፩:00',
          targetGroup: 'የወጣቶች መዘምራን',
          status: 'ACTIVE',
          phone: '0912-34-56-78',
          notes: 'የፆመ ድጓና የክብረ በዓላት መዝሙራት ልምምድ መምራት',
        },
        {
          id: 'asgn_mz2',
          title: 'የሕፃናት መዘምራን አስተባባሪ',
          assigneeName: 'መዘምሪት ሄለን ግርማ',
          spiritualTitle: 'መዘምሪት',
          dutyType: 'የሕፃናት ዜማ መሪ',
          scheduleAmharic: 'እሑድ ጠዋት ፪:00 - ፫:00',
          targetGroup: 'የሕፃናት ክፍል',
          status: 'ACTIVE',
          phone: '0923-45-67-89',
          notes: 'ቀላል ዜማዎችን በከበሮና ጽናጽል ማሰልጠን',
        },
        {
          id: 'asgn_mz3',
          title: 'የበገናና መሰንቆ ዜማ መምህር',
          assigneeName: 'ዲ/ን ቴዎድሮስ አማረ',
          spiritualTitle: 'ዲያቆንና የበገና መምህር',
          dutyType: 'የዜማ መሳሪያዎች መሪ',
          scheduleAmharic: 'ቅዳሜ ከሰዓት ፬:00 - ፮:00',
          targetGroup: 'የበገና ተማሪዎች',
          status: 'ACTIVE',
          phone: '0934-56-78-90',
          notes: 'የበገና አሰካክ፣ ቅኝትና የንስሐ ዜማዎች ስልጠና',
        },
      ];
    }

    if (departmentId === 'records') {
      return [
        {
          id: 'asgn_rc1',
          title: 'የተማሪዎች ምዝገባና ዳታቤዝ ኃላፊ',
          assigneeName: 'አቶ ሃብታሙ ወርቁ',
          spiritualTitle: 'ዋና ተቆጣጣሪ',
          dutyType: 'የምዝገባ አስተባባሪ',
          scheduleAmharic: 'እሑድ ከቀኑ ፭:00 - ፯:00',
          targetGroup: 'ሁሉም ክፍሎች',
          status: 'ACTIVE',
          phone: '0911-89-01-23',
          notes: 'የተማሪዎች ቆጠራና የኮምፒውተር መዝገብ ማደራጀት',
        },
        {
          id: 'asgn_rc2',
          title: 'ሳምንታዊ የመገኘት ሰሌዳ ኦዲተር',
          assigneeName: 'ወ/ሪት ሰላማዊት ታደሰ',
          spiritualTitle: 'ተቆጣጣሪ',
          dutyType: 'የመገኘት ኦዲተር',
          scheduleAmharic: 'እሑድ ከቀኑ ፫:00 - ፬:፴',
          targetGroup: 'የማዕከላውያንና ወጣቶች ክፍሎች',
          status: 'ACTIVE',
          phone: '0922-90-12-34',
          notes: 'የደብተርና የመገኘት መዝገብ ሰብስቦ መመርመር',
        },
      ];
    }

    if (departmentId === 'media') {
      return [
        {
          id: 'asgn_md1',
          title: 'ሳምንታዊ ማስታወቂያዎችና የህትመት ኃላፊ',
          assigneeName: 'ዲ/ን አማኑኤል ተስፋዬ',
          spiritualTitle: 'ዲያቆን',
          dutyType: 'የህዝብ ግንኙነት መሪ',
          scheduleAmharic: 'ሳምንታዊ እሑድ ጠዋት',
          targetGroup: 'ለመላው ምዕመናን',
          status: 'ACTIVE',
          phone: '0933-01-23-45',
          notes: 'የሰንበት ጉባኤ ቃለ-አዋዲ ማስተላለፍና በራሪ ወረቀት ማሰራጨት',
        },
        {
          id: 'asgn_md2',
          title: 'የቀጥታ ስርጭትና ቪዲዮ ቀረጻ መሪ',
          assigneeName: 'ዮናስ ብርሃኑ',
          spiritualTitle: 'የሚዲያ ባለሙያ',
          dutyType: 'የቀረጻ አስተባባሪ',
          scheduleAmharic: 'በበዓላትና እሑድ ከሰዓት',
          targetGroup: 'የዲጂታል ሚዲያ ተከታዮች',
          status: 'ACTIVE',
          phone: '0944-12-34-56',
          notes: 'የመድረክ ትዕይንቶችና ትምህርቶችን ማህደር ማጠናቀር',
        },
      ];
    }

    if (departmentId === 'finance') {
      return [
        {
          id: 'asgn_fn1',
          title: 'የልማት ፕሮጀክቶች አስተባባሪ',
          assigneeName: 'አቶ ተክለ ሃይማኖት ካሳ',
          spiritualTitle: 'የኮሚቴ ሰብሳቢ',
          dutyType: 'የፕሮጀክት መሪ',
          scheduleAmharic: 'ሳምንታዊ ቅዳሜ ከቀኑ ፲:00',
          targetGroup: 'የሰንበት ት/ቤት ልማት',
          status: 'ACTIVE',
          phone: '0911-34-56-78',
          notes: 'የሕፃናት ማዕከል እድሳት ስራዎችን በበላይነት መምራት',
        },
        {
          id: 'asgn_fn2',
          title: 'የወርሃዊ መዋጮና ደረሰኝ ሹም',
          assigneeName: 'ወ/ሮ ብርቱካን አለሙ',
          spiritualTitle: 'ገንዘብ ያዥ',
          dutyType: 'የፋይናንስ ኦፊሰር',
          scheduleAmharic: 'በየወሩ ፴',
          targetGroup: 'ደጋፊ ምዕመናንና አባላት',
          status: 'ACTIVE',
          phone: '0922-45-67-89',
          notes: 'ደረሰኝ መቁረጥና ገቢውን በባንክ ገቢ ማድረግ',
        },
        {
          id: 'asgn_fn3',
          title: 'የበጎ አድራጎትና ድጋፍ አስተባባሪ',
          assigneeName: 'ዲ/ን ዮሴፍ ተስፋዬ',
          spiritualTitle: 'ዲያቆን',
          dutyType: 'የበጎ አድራጎት መሪ',
          scheduleAmharic: 'ወርሃዊ ቋሚ',
          targetGroup: 'አቅመ-ደካማ ተማሪዎች',
          status: 'ACTIVE',
          phone: '0933-56-78-90',
          notes: 'የትምህርት ቁሳቁስና አልባሳት ድጋፍን ማከፋፈል',
        },
      ];
    }

    // Default / Custom department assignments
    return [
      {
        id: 'asgn_gen1',
        title: `${currentDept.titleAmharic} ዋና አስተባባሪ`,
        assigneeName: currentDept.coordinatorName || 'የክፍሉ ኃላፊ',
        spiritualTitle: 'አስተባባሪ',
        dutyType: 'ዋና መሪ',
        scheduleAmharic: 'ሳምንታዊ ቋሚ',
        targetGroup: 'የክፍሉ አባላት',
        status: 'ACTIVE',
        phone: '0911-00-11-22',
        notes: 'የክፍሉን ሳምንታዊ ስራዎችና ምደባዎች በበላይነት መቆጣጠር',
      },
      {
        id: 'asgn_gen2',
        title: 'የክፍሉ ጸሐፊና ሰነድ ያዥ',
        assigneeName: 'በረከት ሃብታሙ',
        spiritualTitle: 'ጸሐፊ',
        dutyType: 'የሰነድ አስተዳዳሪ',
        scheduleAmharic: 'እሑድ ከሰዓት',
        targetGroup: 'የክፍሉ ማህደር',
        status: 'ACTIVE',
        phone: '0922-11-22-33',
        notes: 'ቃለ ጉባኤዎችን መመዝገብና መረጃዎችን ማደራጀት',
      },
    ];
  });

  // 5. Department Tasks & Schedule
  const [tasks, setTasks] = useState<DepartmentTask[]>(() => {
    try {
      const saved = localStorage.getItem(`mezgebe_dept_tasks_${departmentId}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }

    if (departmentId === 'education') {
      return [
        {
          id: 'tsk_ed1',
          title: 'የ፩ኛ መንፈቅ ዓመት የፈተና ጥያቄዎች ዝግጅት',
          dateAmharic: 'የካቲት ፲፭ ፳፻፲፮ ዓ.ም',
          timeAmharic: 'ከቀኑ ፰:00 - ፲:00',
          assignedTo: 'መምህር ኤርምያስ በላይ',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          description: 'ለሕፃናት፣ ማዕከላውያንና ወጣቶች የነገረ ሃይማኖትና የመጽሐፍ ቅዱስ ፈተና ማዘጋጀት።',
        },
        {
          id: 'tsk_ed2',
          title: 'የመምህራን ወርሃዊ የስርዓተ-ትምህርት ግምገማ',
          dateAmharic: 'የካቲት ፳ ፳፻፲፮ ዓ.ም',
          timeAmharic: 'ከቀኑ ፱:00',
          assignedTo: 'መምህራን ኮሚቴ',
          status: 'PENDING',
          priority: 'MEDIUM',
          description: 'የክፍል ደረጃዎች የትምህርት ሽፋንና የተማሪዎች መገኘት ሪፖርት መገምገም።',
        },
        {
          id: 'tsk_ed3',
          title: 'የሕፃናት ማስተማሪያ ስዕላዊ ሞጁሎች ማሰራጨት',
          dateAmharic: 'የካቲት ፰ ፳፻፲፮ ዓ.ም',
          timeAmharic: 'ከጠዋቱ ፫:00',
          assignedTo: 'ዲ/ን አማኑኤል',
          status: 'COMPLETED',
          priority: 'NORMAL',
          description: 'የቀለም ቅብና የመጽሐፍ ቅዱስ ታሪክ ማስተማሪያ ካርዶች ለክፍሎች መሰራጨታቸውን ማረጋገጥ።',
        },
      ];
    }

    if (departmentId === 'mezmur') {
      return [
        {
          id: 'tsk_mz1',
          title: 'የበዓለ ሃምሳና የበዓላት መዝሙራት ልምምድ',
          dateAmharic: 'ቅዳሜ ከሰዓት ፰:00 - ፲፩:00',
          timeAmharic: 'ሳምንታዊ ቋሚ',
          assignedTo: 'ሊቀ መዘምራን ገብረ ማርያም',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          description: 'የወጣቶችና የማዕከላውያን መዘምራን የጋራ የድምፅና የበገና አጀብ ልምምድ።',
        },
        {
          id: 'tsk_mz2',
          title: 'የሕፃናት መዘምራን የዜማና ማህሌት ቅኝት ስልጠና',
          dateAmharic: 'እሑድ ጠዋት ፪:00 - ፫:00',
          timeAmharic: 'ቋሚ',
          assignedTo: 'መዘምሪት ሄለን ግርማ',
          status: 'PENDING',
          priority: 'MEDIUM',
          description: 'የቅዱስ ያሬድ መሠረታዊ የዜማ ምልክቶች (ይዘት፣ ርክርክ፣ ድረት) ለሕፃናት ማስተማር።',
        },
        {
          id: 'tsk_mz3',
          title: 'የመዝሙር ደብተር ፬ኛ እትም ህትመት ቁጥጥር',
          dateAmharic: 'የካቲት ፲፪ ፳፻፲፮ ዓ.ም',
          timeAmharic: 'ከሰዓት ፬:00',
          assignedTo: 'የዜማ ኮሚቴ',
          status: 'COMPLETED',
          priority: 'NORMAL',
          description: 'በደብተሩ ውስጥ የተካተቱ አዳዲስና ጥንታዊ መዝሙራት ስንኝና ዜማ ማረጋገጥ።',
        },
      ];
    }

    return [
      {
        id: 'tsk_gen1',
        title: `${currentDept.titleAmharic} ሳምንታዊ መርሐ ግብርና ስብሰባ`,
        dateAmharic: 'እሑድ ከሰዓት ፯:00',
        timeAmharic: 'ሳምንታዊ',
        assignedTo: currentDept.coordinatorName || 'የክፍሉ አስተባባሪ',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        description: 'የክፍሉ አገልጋዮች የሳምንቱን የስራ አፈፃፀም የሚገመግሙበትና ቀጣዩን የሚያቅዱበት ጉባኤ።',
      },
      {
        id: 'tsk_gen2',
        title: 'የክፍሉ አባላት ምደባና የስራ ድልድል ማጽደቅ',
        dateAmharic: 'የካቲት ፳፭ ፳፻፲፮ ዓ.ም',
        timeAmharic: 'ከቀኑ ፰:00',
        assignedTo: 'የክፍሉ ኮሚቴ',
        status: 'PENDING',
        priority: 'MEDIUM',
        description: 'የተሰጡ ተግባራትን በወቅቱ ለማጠናቀቅ ኃላፊነቶችን ማከፋፈል።',
      },
    ];
  });

  // 6. Documents & Resources
  const [documents, setDocuments] = useState<DepartmentDocument[]>(() => {
    try {
      const saved = localStorage.getItem(`mezgebe_dept_docs_${departmentId}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }

    return [
      {
        id: 'doc_1',
        title: `${currentDept.titleAmharic} የ2019 ዓ.ም ዓመታዊ የስራ መመሪያ ሰነድ`,
        category: 'የስራ መመሪያ',
        fileType: 'PDF',
        dateAmharic: 'መስከረም ፳፻፲፮ ዓ.ም',
        author: currentDept.coordinatorName || 'አስተባባሪ ኮሚቴ',
        sizeAmharic: '1.8 MB',
        description: 'የክፍሉን ዓላማ፣ ተግባራት፣ የጊዜ ሰሌዳና የአገልጋዮች ስነ-ስርዓት የሚደነግግ ይፋዊ ሰነድ።',
      },
      {
        id: 'doc_2',
        title: 'የሩብ ዓመት የስራ አፈፃፀም ሪፖርትና ስታትስቲክስ',
        category: 'ሪፖርት',
        fileType: 'DOCX',
        dateAmharic: 'ጥር ፳፻፲፮ ዓ.ም',
        author: 'የክፍሉ ጸሐፊ',
        sizeAmharic: '850 KB',
        description: 'ባለፉት ሦስት ወራት የተከናወኑ ዋና ዋና ተግባራት፣ የተሳተፉ አባላት ብዛትና የቀጣይ ግቦች።',
      },
      {
        id: 'doc_3',
        title: 'የአባላት አድራሻና የክህሎት ዝርዝር መዝገብ',
        category: 'መረጃ',
        fileType: 'XLSX',
        dateAmharic: 'ታህሳስ ፳፻፲፮ ዓ.ም',
        author: 'የቁጥጥር ክፍል',
        sizeAmharic: '420 KB',
        description: 'በክፍሉ ስር የሚገኙ አገልጋዮች ስልክ፣ የትምህርት ደረጃና መንፈሳዊ አገልግሎት ታሪክ።',
      },
    ];
  });

  // 7. Minutes
  const [minutes, setMinutes] = useState<DepartmentMinute[]>(() => {
    return [
      {
        id: 'min_1',
        title: 'የወርሃዊ የክፍሉ አገልጋዮች መደበኛ ስብሰባ ቃለ-ጉባኤ',
        dateAmharic: 'ጥር ፳፰ ፳፻፲፮ ዓ.ም',
        attendeesCount: 14,
        chairPerson: currentDept.coordinatorName || 'አስተባባሪ',
        decisions: [
          'ሳምንታዊ መርሐ ግብራት በሰዓቱ እንዲጀመሩ አባላት በሙሉ ማሳሰቢያ ተሰጥቷል።',
          'ለቀጣዩ ወር የሚያስፈልጉ ግብዓቶች ዝርዝር ለሰንበት ት/ቤቱ ሥራ አስፈፃሚ እንዲቀርብ ተወስኗል።',
          'አዳዲስ አባላትን የማብቃት ስልጠና በሚቀጥለው ሳምንት እንዲጀመር ተስማምተናል።',
        ],
      },
    ];
  });

  // ----------------------------------------------------
  // INTERACTIVE HANDLERS FOR PERSISTENCE & ACTIONS
  // ----------------------------------------------------

  // New assignment form state
  const [newAsgnTitle, setNewAsgnTitle] = useState('');
  const [newAsgnAssignee, setNewAsgnAssignee] = useState('');
  const [newAsgnSpiritualTitle, setNewAsgnSpiritualTitle] = useState('አገልጋይ');
  const [newAsgnDutyType, setNewAsgnDutyType] = useState('');
  const [newAsgnSchedule, setNewAsgnSchedule] = useState('');
  const [newAsgnTargetGroup, setNewAsgnTargetGroup] = useState('');
  const [newAsgnPhone, setNewAsgnPhone] = useState('');
  const [newAsgnNotes, setNewAsgnNotes] = useState('');

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'NORMAL'>('MEDIUM');

  // New doc form state
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');

  // New minute form state
  const [newMinuteTitle, setNewMinuteTitle] = useState('');
  const [newMinuteDate, setNewMinuteDate] = useState('');
  const [newMinuteChair, setNewMinuteChair] = useState('');
  const [newMinuteDecisions, setNewMinuteDecisions] = useState('');

  // Helper to persist assignments
  const handleSaveAssignments = (updated: DepartmentAssignment[]) => {
    setAssignments(updated);
    try {
      localStorage.setItem(`mezgebe_dept_assignments_${departmentId}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleToggleAssignmentStatus = (id: string) => {
    const updated = assignments.map((a) => {
      if (a.id === id) {
        return {
          ...a,
          status: (a.status === 'COMPLETED' ? 'ACTIVE' : 'COMPLETED') as 'ACTIVE' | 'COMPLETED',
        };
      }
      return a;
    });
    handleSaveAssignments(updated);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgnTitle.trim() || !newAsgnAssignee.trim()) return;

    const item: DepartmentAssignment = {
      id: `asgn_${Date.now()}`,
      title: newAsgnTitle.trim(),
      assigneeName: newAsgnAssignee.trim(),
      spiritualTitle: newAsgnSpiritualTitle.trim() || 'አገልጋይ',
      dutyType: newAsgnDutyType.trim() || 'የክፍሉ አገልጋይ',
      scheduleAmharic: newAsgnSchedule.trim() || 'ሳምንታዊ ቋሚ',
      targetGroup: newAsgnTargetGroup.trim() || 'የሰንበት ት/ቤት',
      status: 'ACTIVE',
      phone: newAsgnPhone.trim() || '0911-00-00-00',
      notes: newAsgnNotes.trim() || 'በክፍሉ የተሰጠ ይፋዊ ምደባ',
    };

    handleSaveAssignments([item, ...assignments]);
    setNewAsgnTitle('');
    setNewAsgnAssignee('');
    setNewAsgnDutyType('');
    setNewAsgnSchedule('');
    setNewAsgnTargetGroup('');
    setNewAsgnPhone('');
    setNewAsgnNotes('');
    setShowAddAssignmentModal(false);
  };

  const handleToggleTaskStatus = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: (t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED') as 'PENDING' | 'COMPLETED',
        };
      }
      return t;
    });
    setTasks(updated);
    try {
      localStorage.setItem(`mezgebe_dept_tasks_${departmentId}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: DepartmentTask = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      dateAmharic: newTaskDate.trim() || 'የካቲት ፳፻፲፮ ዓ.ም',
      timeAmharic: newTaskTime.trim() || 'ከሰዓት',
      assignedTo: newTaskAssignee.trim() || (currentDept.coordinatorName || 'የክፍሉ አስተባባሪ'),
      status: 'PENDING',
      priority: newTaskPriority,
      description: newTaskDesc.trim() || 'በክፍሉ የታቀደ ተግባር',
    };

    const updated = [task, ...tasks];
    setTasks(updated);
    try {
      localStorage.setItem(`mezgebe_dept_tasks_${departmentId}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setNewTaskTitle('');
    setNewTaskDate('');
    setNewTaskTime('');
    setNewTaskAssignee('');
    setNewTaskDesc('');
    setShowAddTaskModal(false);
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    const docItem: DepartmentDocument = {
      id: `doc_${Date.now()}`,
      title: newDocTitle.trim(),
      category: newDocCategory.trim() || 'ሰነድ',
      fileType: 'PDF',
      dateAmharic: 'የካቲት ፳፻፲፮ ዓ.ም',
      author: currentDept.coordinatorName || 'የክፍሉ አስተባባሪ',
      sizeAmharic: '1.2 MB',
      description: newDocDesc.trim() || 'በክፍሉ ማህደር ውስጥ የተመዘገበ ይፋዊ ሰነድ',
    };

    const updated = [docItem, ...documents];
    setDocuments(updated);
    try {
      localStorage.setItem(`mezgebe_dept_docs_${departmentId}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setNewDocTitle('');
    setNewDocCategory('');
    setNewDocDesc('');
    setShowAddDocModal(false);
  };

  const handleCreateMinute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMinuteTitle.trim()) return;

    const decisionLines = newMinuteDecisions
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const minItem: DepartmentMinute = {
      id: `min_${Date.now()}`,
      title: newMinuteTitle.trim(),
      dateAmharic: newMinuteDate.trim() || 'የካቲት ፳፻፲፮ ዓ.ም',
      attendeesCount: 14,
      chairPerson: newMinuteChair.trim() || (currentDept.coordinatorName || 'የክፍሉ አስተባባሪ'),
      decisions: decisionLines.length > 0 ? decisionLines : ['በሙሉ ድምፅ ቃለ ጉባኤው ጸድቋል።'],
    };

    setMinutes([minItem, ...minutes]);
    setNewMinuteTitle('');
    setNewMinuteDate('');
    setNewMinuteChair('');
    setNewMinuteDecisions('');
    setShowAddMinuteModal(false);
  };

  // Helper to render icons
  const renderIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Palette':
        return <Palette className={className} />;
      case 'CalendarDays':
        return <CalendarDays className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Music':
        return <Music className={className} />;
      case 'Users':
        return <Users className={className} />;
      case 'Megaphone':
        return <Megaphone className={className} />;
      case 'HandCoins':
        return <HandCoins className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'UserCheck':
        return <UserCheck className={className} />;
      case 'Shield':
        return <Shield className={className} />;
      case 'Target':
        return <Target className={className} />;
      case 'TrendingUp':
        return <TrendingUp className={className} />;
      default:
        return <Layers className={className} />;
    }
  };

  // Filtered lists
  const responsibilities = getDepartmentResponsibilities();
  const kpis = getDepartmentKPIs();
  const goals = getDepartmentGoals();

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.dutyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.targetGroup.toLowerCase().includes(searchQuery.toLowerCase());
    if (assignmentFilter === 'ACTIVE') return matchesSearch && a.status === 'ACTIVE';
    if (assignmentFilter === 'COMPLETED') return matchesSearch && a.status === 'COMPLETED';
    return matchesSearch;
  });

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F9FAFD] dark:bg-[#0B1320] text-slate-800 dark:text-slate-100">
      {/* App Header */}
      <AppHeader
        title={currentDept.titleAmharic}
        subtitle="የሰንበት ት/ቤት ኃላፊነቶች፣ ምደባዎችና ዳሽቦርድ"
        onOpenDepartmentsHub={onOpenDepartmentsHub}
      />

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-5">
        {/* Department Gate Top Badge Banner */}
        <div
          className="relative overflow-hidden rounded-3xl p-5 sm:p-7 shadow-lg text-white border-2 border-white/20"
          style={{
            background: `linear-gradient(135deg, ${currentDept.accentColor || '#0C4A9E'} 0%, #071A36 100%)`,
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-white shrink-0 shadow-inner">
                {renderIcon(currentDept.iconName, 'w-9 h-9 sm:w-11 sm:h-11 text-[#FFD54F]')}
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-bold text-[#FFD54F] border border-white/25 mb-2">
                  <Shield className="w-3.5 h-3.5" />
                  <span>ተልእኮ፣ ኃላፊነትና የአገልጋዮች ምደባ (Official Command Center)</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-bold font-serif-ethiopic leading-tight">
                  {currentDept.titleAmharic}
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 mt-1.5 max-w-xl font-medium leading-relaxed">
                  {currentDept.descriptionAmharic}
                </p>
                <div className="flex flex-wrap items-center gap-3.5 mt-3.5 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#FFD54F]" />
                    <span>
                      አስተባባሪ፦{' '}
                      <strong className="text-white">
                        {currentDept.coordinatorName || 'የክፍሉ አስተባባሪ'}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#FFD54F]" />
                    <span>{assignments.length} የተመደቡ አገልጋዮች</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-emerald-400" />
                    <span>{responsibilities.length} ቀኖናዊ ኃላፊነቶች</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={onOpenDepartmentsHub}
                className="py-2.5 px-4 rounded-xl bg-white text-[#072958] font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <ArrowLeftRight className="w-4 h-4 text-[#B88500]" />
                <span>የመግቢያ በር ቀይር (Switch Gate)</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onSwitchToKinetibeb}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-black/30 hover:bg-black/50 text-[11px] font-bold text-white border border-white/20 transition-colors flex items-center justify-center gap-1"
                >
                  <Palette className="w-3.5 h-3.5 text-[#FFD54F]" />
                  <span>ወደ ኪነጥበብ</span>
                </button>
                <button
                  type="button"
                  onClick={onSwitchToEhudMerhaGibir}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-black/30 hover:bg-black/50 text-[11px] font-bold text-white border border-white/20 transition-colors flex items-center justify-center gap-1"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-[#FFD54F]" />
                  <span>ወደ እሁድ መርሐ ግብር</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Departmental Pillars Navigation Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setActiveDepartment(departmentId);
              if (onNavigateToArchive) onNavigateToArchive();
            }}
            className="p-3 rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 hover:border-[#0C4A9E] shadow-2xs text-left transition-all cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0C4A9E] dark:text-[#7FAFFF] group-hover:bg-[#0C4A9E] group-hover:text-white transition-colors">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">የክፍሉ መዝገብ</div>
              <div className="text-[10px] text-slate-500">ሰነዶችና ቅርሶች</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveDepartment(departmentId);
              if (onNavigateToSearch) onNavigateToSearch();
            }}
            className="p-3 rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 hover:border-[#B88500] shadow-2xs text-left transition-all cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#B88500] dark:text-[#FFD54F] group-hover:bg-[#B88500] group-hover:text-white transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">በክፍሉ ፈልግ</div>
              <div className="text-[10px] text-slate-500">ይዘቶችና ደራሲያን</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveDepartment(departmentId);
              if (onNavigateToEvents) onNavigateToEvents();
            }}
            className="p-3 rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 hover:border-emerald-600 shadow-2xs text-left transition-all cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">መርሐ ግብራት</div>
              <div className="text-[10px] text-slate-500">ቀን መቁጠሪያና ዕቅድ</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveDepartment(departmentId);
              if (onNavigateToProfile) onNavigateToProfile();
            }}
            className="p-3 rounded-2xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 hover:border-purple-600 shadow-2xs text-left transition-all cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">የክፍሉ መገለጫ</div>
              <div className="text-[10px] text-slate-500">አባላትና አመራር</div>
            </div>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar gap-1 bg-white dark:bg-[#111D30] p-1.5 rounded-2xl border shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'DASHBOARD'
                ? 'bg-[#0C4A9E] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>ዳሽቦርድና ስታትስቲክስ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RESPONSIBILITIES')}
            className={`flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'RESPONSIBILITIES'
                ? 'bg-[#0C4A9E] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>የክፍሉ ኃላፊነቶች ({responsibilities.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ASSIGNMENTS')}
            className={`flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'ASSIGNMENTS'
                ? 'bg-[#0C4A9E] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>የሥራ ምደባና ስምሪት ({assignments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TASKS')}
            className={`flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'TASKS'
                ? 'bg-[#0C4A9E] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>መርሐ ግብርና ተግባራት ({tasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DOCS')}
            className={`flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'DOCS'
                ? 'bg-[#0C4A9E] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>ሰነዶችና ማህደር ({documents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('MINUTES')}
            className={`flex items-center gap-1.5 py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'MINUTES'
                ? 'bg-[#0C4A9E] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>ቃለ ጉባኤ ({minutes.length})</span>
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: EXECUTIVE DASHBOARD                           */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-5">
            {/* 4 Live KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {kpis.map((kpi) => (
                <ManuscriptBox key={kpi.id} className="p-4 relative overflow-hidden">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {kpi.label}
                    </span>
                    <div
                      className="p-2 rounded-xl text-white shadow-xs shrink-0"
                      style={{ backgroundColor: kpi.color }}
                    >
                      {renderIcon(kpi.iconName, 'w-4 h-4')}
                    </div>
                  </div>

                  <div className="text-xl sm:text-2xl font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                    {kpi.value}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {kpi.subtext}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{kpi.change}</span>
                    </span>
                    <span className="text-slate-400">ወቅታዊ መረጃ</span>
                  </div>
                </ManuscriptBox>
              ))}
            </div>

            {/* Department Health & Goal Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left 2 Cols: Strategic Milestones & Goals */}
              <div className="lg:col-span-2 space-y-3.5">
                <ManuscriptBox className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#B88500]" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif-ethiopic">
                        የክፍሉ ዓመታዊ ስልታዊ ግቦችና አፈፃፀም
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-[#0C4A9E] dark:text-[#7FAFFF] bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full">
                      2019 ዓ.ም
                    </span>
                  </div>

                  <div className="space-y-4">
                    {goals.map((g) => (
                      <div key={g.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {g.title}
                          </span>
                          <span className="font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                            {g.progressPercent}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${g.progressPercent}%`,
                              backgroundColor:
                                g.progressPercent === 100
                                  ? '#16A34A'
                                  : g.progressPercent > 70
                                  ? '#0C4A9E'
                                  : '#B88500',
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>
                            አሁን፦ <strong>{g.currentAmharic}</strong>
                          </span>
                          <span>
                            ግብ፦ <strong>{g.targetAmharic}</strong>
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {g.statusText}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ManuscriptBox>

                {/* Quick Shortcuts to Responsibilities and Duty Roster */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setActiveTab('RESPONSIBILITIES')}
                    className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/30 dark:to-[#111D30] border border-[#B88500]/40 cursor-pointer hover:shadow-md transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#B88500] uppercase tracking-wider mb-1">
                        ቀኖናዊ የስራ ድንጋጌ
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif-ethiopic">
                        የክፍሉ ኃላፊነቶች ({responsibilities.length})
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        የሰንበት ት/ቤቱን ቃለ-አዋዲና ኃላፊነቶች እይ
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#B88500]" />
                  </div>

                  <div
                    onClick={() => setActiveTab('ASSIGNMENTS')}
                    className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/60 dark:from-blue-950/30 dark:to-[#111D30] border border-blue-200 dark:border-blue-900 cursor-pointer hover:shadow-md transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0C4A9E] dark:text-[#7FAFFF] uppercase tracking-wider mb-1">
                        የሥራ ስምሪት
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif-ethiopic">
                        የአገልጋዮች ምደባ ({assignments.length})
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        ማን ምን እንደሚሰራና የሰዓት ሰሌዳ
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#0C4A9E] dark:text-[#7FAFFF]" />
                  </div>
                </div>
              </div>

              {/* Right Col: Leadership & Health Audit */}
              <div className="space-y-3.5">
                <ManuscriptBox className="p-5">
                  <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0C4A9E] to-[#B88500] text-white flex items-center justify-center mx-auto shadow-md mb-2.5">
                      {renderIcon(currentDept.iconName, 'w-7 h-7 text-[#FFD54F]')}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif-ethiopic">
                      የክፍሉ አጠቃላይ አፈፃፀም
                    </h3>
                    <div className="text-2xl font-bold font-serif-ethiopic text-emerald-600 dark:text-emerald-400 mt-1">
                      89.2% (እጅግ በጣም ጥሩ)
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      በሰንበት ት/ቤቱ ስራ አስፈፃሚ ደረጃ «ደረጃ ፩» ተሰጥቶታል
                    </p>
                  </div>

                  <div className="pt-3.5 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">ዋና ኃላፊ፦</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {currentDept.coordinatorName || 'የክፍሉ አስተባባሪ'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">የአገልጋዮች ብዛት፦</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {assignments.length} አገልጋዮች
                      </strong>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">ሳምንታዊ ስብሰባ፦</span>
                      <strong className="text-[#0C4A9E] dark:text-[#7FAFFF]">
                        እሑድ ከሰዓት ፯:00
                      </strong>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500 dark:text-slate-400">ይፋዊ ቢሮ፦</span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        ክፍል ፫ (ሰንበት ት/ቤት ህንፃ)
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddAssignmentModal(true)}
                    className="w-full mt-4 py-2.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>አዲስ አገልጋይ መድብ +</span>
                  </button>
                </ManuscriptBox>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: RESPONSIBILITIES IN THE SUNDAY SCHOOL          */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'RESPONSIBILITIES' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-2xl border border-[#B88500]/30">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 font-serif-ethiopic flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#B88500]" />
                  <span>የ{currentDept.titleAmharic} ቀኖናዊና አስተዳደራዊ ኃላፊነቶች</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  በደብረ መድኃኒት ተክለ ሣዊሮስ ሰንበት ትምህርት ቤት ቃለ-አዋዲ መሠረት ለክፍሉ የተሰጡ ኃላፊነቶች ዝርዝር
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-[#111D30] border border-[#B88500]/40 text-xs font-bold text-[#B88500]">
                <span>{responsibilities.length} ይፋዊ ድንጋጌዎች</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {responsibilities.map((resp, index) => (
                <ManuscriptBox key={resp.id} className="p-5 hover:border-[#B88500]/60 transition-all">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#0C4A9E] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 font-serif-ethiopic">
                        {resp.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0C4A9E] dark:text-[#7FAFFF]">
                        {resp.category}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-[#FFD54F] border border-amber-200 dark:border-amber-800">
                        ድግግሞሽ፦ {resp.cycle}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-3.5 leading-relaxed">
                    {resp.description}
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] font-bold text-[#B88500] uppercase tracking-wider mb-2 font-serif-ethiopic flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>የሚጠበቁ ቁልፍ ግቦችና ውጤቶች፦</span>
                    </div>
                    <ul className="space-y-1.5">
                      {resp.objectives.map((obj, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                        >
                          <span className="text-[#0C4A9E] font-bold">•</span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3.5 pt-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-[#0C4A9E] dark:text-[#7FAFFF]" />
                      <span>
                        ኃላፊነት የተሰጠው አካል፦{' '}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {resp.leadOfficer}
                        </strong>
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      የሰንበት ት/ቤት ቃለ-አዋዲ ክፍል ፯ ድንጋጌ ✓
                    </span>
                  </div>
                </ManuscriptBox>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: DUTY ASSIGNMENTS (የአገልጋዮች ስምሪት)             */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'ASSIGNMENTS' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="አገልጋዮችን፣ ስምሪቶችን፣ የክፍል ደረጃዎችን ፈልግ..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-xl bg-white dark:bg-[#111D30] border border-slate-200 dark:border-slate-800 p-0.5 text-xs font-medium">
                  <button
                    onClick={() => setAssignmentFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs ${
                      assignmentFilter === 'ALL'
                        ? 'bg-[#0C4A9E] text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    ሁሉም ({assignments.length})
                  </button>
                  <button
                    onClick={() => setAssignmentFilter('ACTIVE')}
                    className={`px-3 py-1.5 rounded-lg text-xs ${
                      assignmentFilter === 'ACTIVE'
                        ? 'bg-[#0C4A9E] text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    ንቁ ስምሪት
                  </button>
                  <button
                    onClick={() => setAssignmentFilter('COMPLETED')}
                    className={`px-3 py-1.5 rounded-lg text-xs ${
                      assignmentFilter === 'COMPLETED'
                        ? 'bg-[#0C4A9E] text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    የተጠናቀቁ
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddAssignmentModal(true)}
                  className="py-2 px-3.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>አዲስ ምደባ ፍጠር</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredAssignments.map((asgn) => (
                <ManuscriptBox
                  key={asgn.id}
                  className={`p-4 transition-all duration-200 ${
                    asgn.status === 'COMPLETED' ? 'opacity-70 bg-slate-50 dark:bg-slate-900/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0C4A9E] dark:text-[#7FAFFF]">
                          {asgn.spiritualTitle}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif-ethiopic">
                          {asgn.assigneeName}
                        </h4>
                      </div>
                      <div className="text-xs font-bold text-[#B88500] mt-0.5">{asgn.title}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleAssignmentStatus(asgn.id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors shrink-0 ${
                        asgn.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50'
                          : 'bg-blue-50 text-[#0C4A9E] border-blue-200 dark:bg-blue-950/50'
                      }`}
                    >
                      {asgn.status === 'COMPLETED' ? 'ተጠናቋል ✓' : 'በስራ ላይ (Active)'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                    {asgn.notes}
                  </p>

                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>ሰዓት፦ {asgn.scheduleAmharic}</span>
                      </span>
                      <span className="font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                        {asgn.targetGroup}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Phone className="w-3 h-3" />
                        <span>{asgn.phone}</span>
                      </span>
                      <span className="text-slate-500 font-medium">ሚና፦ {asgn.dutyType}</span>
                    </div>
                  </div>
                </ManuscriptBox>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: TASKS & OPERATIONS                            */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'TASKS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif-ethiopic">
                  የክፍሉ ሳምንታዊ መርሐ ግብራትና ተግባራት
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  የቀነ-ቀጠሮዎች፣ የስብሰባዎችና የተግባራት ቁጥጥር ሰሌዳ
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddTaskModal(true)}
                className="py-2 px-3.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>አዲስ ተግባር መዝግብ</span>
              </button>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <ManuscriptBox
                  key={task.id}
                  className={`p-4 transition-all duration-200 ${
                    task.status === 'COMPLETED' ? 'opacity-70 bg-slate-50 dark:bg-slate-900/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(task.id)}
                        className={`mt-0.5 p-1 rounded-lg border transition-all ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-500 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-700 text-transparent hover:border-[#0C4A9E]'
                        }`}
                        title={task.status === 'COMPLETED' ? 'እንደገና መልስ' : 'ተግባሩ ተጠናቋል'}
                      >
                        <CheckCircle className="w-4 h-4 fill-current" />
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4
                            className={`text-sm font-bold font-serif-ethiopic ${
                              task.status === 'COMPLETED'
                                ? 'line-through text-slate-500 dark:text-slate-400'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {task.title}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              task.priority === 'HIGH'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : task.priority === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {task.priority === 'HIGH'
                              ? 'አስቸኳይ'
                              : task.priority === 'MEDIUM'
                              ? 'መካከለኛ'
                              : 'መደበኛ'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                          {task.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{task.dateAmharic}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{task.timeAmharic}</span>
                          </div>
                          <div className="flex items-center gap-1 font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>ኃላፊ፦ {task.assignedTo}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-[#0C4A9E] dark:text-[#7FAFFF] border border-blue-200'
                        }`}
                      >
                        {task.status === 'COMPLETED' ? 'ተጠናቋል ✓' : 'በሂደት ላይ'}
                      </span>
                    </div>
                  </div>
                </ManuscriptBox>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: DOCUMENTS & ARCHIVE                           */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'DOCS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif-ethiopic">
                  የ{currentDept.titleAmharic} ሰነዶችና የስራ መመሪያዎች
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  የስራ መመሪያዎች፣ ሞጁሎች፣ መዝገቦችና የክፍሉ ይፋዊ ሰነዶች
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddDocModal(true)}
                className="py-2 px-3.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>አዲስ ሰነድ መዝግብ</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {documents.map((doc) => (
                <ManuscriptBox
                  key={doc.id}
                  className="p-4 hover:border-[#B88500]/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#B88500] border border-[#B88500]/30 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {doc.category}
                        </span>
                        <span className="text-[10px] font-bold text-[#0C4A9E] dark:text-[#7FAFFF]">
                          {doc.fileType} • {doc.sizeAmharic}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 font-serif-ethiopic leading-snug">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {doc.description}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                        <span>ጸሐፊ፦ {doc.author}</span>
                        <span>{doc.dateAmharic}</span>
                      </div>
                    </div>
                  </div>
                </ManuscriptBox>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: MINUTES                                      */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'MINUTES' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif-ethiopic">
                  የክፍሉ ቃለ ጉባኤዎችና የግምገማ ማስታወሻዎች
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  የሳምንታዊና ወርሃዊ ስብሰባዎች የተወሰኑ ውሳኔዎች መዝገብ
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddMinuteModal(true)}
                className="py-2 px-3.5 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>ቃለ ጉባኤ ጻፍ</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {minutes.map((min) => (
                <ManuscriptBox key={min.id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold font-serif-ethiopic text-slate-900 dark:text-slate-100">
                      {min.title}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                      {min.dateAmharic}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mb-3">
                    <span>
                      ሰብሳቢ፦{' '}
                      <strong className="text-slate-900 dark:text-slate-200">
                        {min.chairPerson}
                      </strong>
                    </span>
                    <span>
                      የተገኙ አባላት፦{' '}
                      <strong className="text-slate-900 dark:text-slate-200">
                        {min.attendeesCount}
                      </strong>
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="text-[11px] font-bold text-[#B88500] uppercase tracking-wider mb-1.5 font-serif-ethiopic">
                      ዋና ዋና የተላለፉ ውሳኔዎች፦
                    </div>
                    <ul className="space-y-1.5">
                      {min.decisions.map((dec, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                        >
                          <span className="text-[#0C4A9E] font-bold">•</span>
                          <span>{dec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ManuscriptBox>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: CREATE DUTY ASSIGNMENT                      */}
      {/* ---------------------------------------------------- */}
      {showAddAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111D30] rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif-ethiopic flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#B88500]" />
                <span>አዲስ የስራ ስምሪት / ምደባ መዝግብ ({currentDept.titleAmharic})</span>
              </h3>
              <button
                onClick={() => setShowAddAssignmentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የተግባሩ / የአገልግሎቱ መጠሪያ *
                </label>
                <input
                  type="text"
                  required
                  value={newAsgnTitle}
                  onChange={(e) => setNewAsgnTitle(e.target.value)}
                  placeholder="ለምሳሌ፡ የነገረ ሃይማኖት መምህር / የዜማ መሪ"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የአገልጋዩ ሙሉ ስም *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAsgnAssignee}
                    onChange={(e) => setNewAsgnAssignee(e.target.value)}
                    placeholder="ለምሳሌ፡ መምህር ኤርምያስ በላይ"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    መንፈሳዊ ማዕረግ
                  </label>
                  <input
                    type="text"
                    value={newAsgnSpiritualTitle}
                    onChange={(e) => setNewAsgnSpiritualTitle(e.target.value)}
                    placeholder="መምህር፣ ዲያቆን፣ መዘምር፣ አስተባባሪ"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የሰዓት ሰሌዳና ድግግሞሽ
                  </label>
                  <input
                    type="text"
                    value={newAsgnSchedule}
                    onChange={(e) => setNewAsgnSchedule(e.target.value)}
                    placeholder="እሑድ ጠዋት ፪:፴ - ፫:፴"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የዒላማ ቡድን / ክፍል ደረጃ
                  </label>
                  <input
                    type="text"
                    value={newAsgnTargetGroup}
                    onChange={(e) => setNewAsgnTargetGroup(e.target.value)}
                    placeholder="የሕፃናት ክፍል / ወጣቶች"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የስልክ ቁጥር
                  </label>
                  <input
                    type="text"
                    value={newAsgnPhone}
                    onChange={(e) => setNewAsgnPhone(e.target.value)}
                    placeholder="0911-00-00-00"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    የአገልግሎት ዘርፍ
                  </label>
                  <input
                    type="text"
                    value={newAsgnDutyType}
                    onChange={(e) => setNewAsgnDutyType(e.target.value)}
                    placeholder="የክፍል መሪ፣ አሰልጣኝ..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የተሰጠው ተልእኮና ማስታወሻ
                </label>
                <textarea
                  rows={3}
                  value={newAsgnNotes}
                  onChange={(e) => setNewAsgnNotes(e.target.value)}
                  placeholder="የተግባሩ ዝርዝር፣ የሚጠበቁ ውጤቶችና ተልእኮዎች..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAssignmentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold shadow-xs"
                >
                  ምደባውን መዝግብ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: ADD TASK                                    */}
      {/* ---------------------------------------------------- */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111D30] rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif-ethiopic">
                አዲስ ተግባር / መርሐ ግብር መዝግብ ({currentDept.titleAmharic})
              </h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የተግባሩ / መርሐ ግብሩ ርዕስ *
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="ለምሳሌ፡ የመምህራን ወርሃዊ የግምገማ ስብሰባ"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ቀን (በኢትዮጵያ አቆጣጠር)
                  </label>
                  <input
                    type="text"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    placeholder="ለምሳሌ፡ የካቲት ፲፰ ፳፻፲፮ ዓ.ም"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ሰዓት
                  </label>
                  <input
                    type="text"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    placeholder="ለምሳሌ፡ ከቀኑ ፰:00 - ፲:00"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ተጠሪ / ኃላፊ
                  </label>
                  <input
                    type="text"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    placeholder="የአገልጋዩ ስም"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ቅድሚያ ደረጃ
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  >
                    <option value="HIGH">አስቸኳይ (High)</option>
                    <option value="MEDIUM">መካከለኛ (Medium)</option>
                    <option value="NORMAL">መደበኛ (Normal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የተግባሩ ዝርዝር ማብራሪያ
                </label>
                <textarea
                  rows={3}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="የተግባሩን ዓላማና የሚጠበቁ ውጤቶችን ይግለጹ..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold shadow-xs"
                >
                  ተግባሩን መዝግብ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: ADD DOCUMENT                                */}
      {/* ---------------------------------------------------- */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111D30] rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif-ethiopic">
                አዲስ ሰነድ መዝግብ ({currentDept.titleAmharic})
              </h3>
              <button
                onClick={() => setShowAddDocModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የሰነዱ ርዕስ *
                </label>
                <input
                  type="text"
                  required
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="ለምሳሌ፡ የ2019 ዓ.ም የስርዓተ-ትምህርት ሞጁል"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ምድብ / አይነት
                </label>
                <input
                  type="text"
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value)}
                  placeholder="ለምሳሌ፡ የስራ መመሪያ፣ ሪፖርት፣ የትምህርት ሰነድ"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ማብራሪያ
                </label>
                <textarea
                  rows={3}
                  value={newDocDesc}
                  onChange={(e) => setNewDocDesc(e.target.value)}
                  placeholder="ስለ ሰነዱ አጭር መግለጫ..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold shadow-xs"
                >
                  ሰነዱን መዝግብ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 4: ADD MINUTE                                  */}
      {/* ---------------------------------------------------- */}
      {showAddMinuteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111D30] rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif-ethiopic">
                አዲስ ቃለ ጉባኤ መዝግብ ({currentDept.titleAmharic})
              </h3>
              <button
                onClick={() => setShowAddMinuteModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMinute} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የስብሰባው ርዕስ *
                </label>
                <input
                  type="text"
                  required
                  value={newMinuteTitle}
                  onChange={(e) => setNewMinuteTitle(e.target.value)}
                  placeholder="ለምሳሌ፡ ሳምንታዊ መደበኛ ስብሰባ ቃለ ጉባኤ"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ቀን
                  </label>
                  <input
                    type="text"
                    value={newMinuteDate}
                    onChange={(e) => setNewMinuteDate(e.target.value)}
                    placeholder="የካቲት ፳፻፲፮ ዓ.ም"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ሰብሳቢ
                  </label>
                  <input
                    type="text"
                    value={newMinuteChair}
                    onChange={(e) => setNewMinuteChair(e.target.value)}
                    placeholder={currentDept.coordinatorName || 'የክፍሉ ሰብሳቢ'}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  የተላለፉ ዋና ዋና ውሳኔዎች (እያንዳንዱን በመስመር ይጻፉ)
                </label>
                <textarea
                  rows={4}
                  value={newMinuteDecisions}
                  onChange={(e) => setNewMinuteDecisions(e.target.value)}
                  placeholder="ውሳኔ ፩፦ ...&#10;ውሳኔ ፪፦ ...&#10;ውሳኔ ፫፦ ..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#B88500]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMinuteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0C4A9E] hover:bg-[#072958] text-white text-xs font-bold shadow-xs"
                >
                  ቃለ ጉባኤውን መዝግብ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
