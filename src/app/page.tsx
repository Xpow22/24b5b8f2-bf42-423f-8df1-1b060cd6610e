"use client"
import React, { useContext, useEffect, useRef, useState } from 'react';
import type { GetRef, InputRef } from 'antd';
import { Button, Form, Input, Popconfirm, Table, message } from 'antd';
import { Icon } from '@iconify/react';


type FormInstance<T> = GetRef<typeof Form<T>>;
type DataIndex = keyof Item;

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface Item {
  key: string;
  firstName: string;
  lastName: string;
  position: string;
  phone: string;
  email: string;
}

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof Item;
  record: Item;
  dataSource: DataType[];
  handleSave: (record: Item) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  dataSource,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex((item) => record.key === item.key);
      const duplicateIndex = newData.findIndex(item => item.email === values[dataIndex]);
      if (duplicateIndex !== -1 && duplicateIndex !== index) {
        setError('Email must be unique.');
        return;
      } else {
        setError('');
      }

      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    const rules: any[] = [
      {
        required: true,
        message: `${title} is required.`,
      },
    ];

    if (dataIndex === 'email') {
      rules.push({
        type: 'email',
        message: 'The input is not valid E-mail!',
      });
    }
    if (dataIndex === 'phone') {
      rules.push({
        pattern: /^\d+$/,
        message: 'Please enter only numbers.',
      });
    }

    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={rules}
        validateStatus={error && dataIndex === 'email' ? 'error' : undefined}
        help={error && dataIndex === 'email' ? error : undefined}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];

interface DataType {
  key: React.Key;
  firstName: string;
  lastName: string;
  position: string;
  phone: string;
  email: string;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

const App: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([
    {
      key: '0',
      firstName: 'Diska',
      lastName: 'Sabilillah',
      position: 'President',
      phone: '08765656333',
      email: 'diska@mail.com',
    },
    {
      key: '1',
      firstName: 'Fitri',
      lastName: 'Handayani',
      position: 'CTO',
      phone: '0987654321',
      email: 'fitri@mail.com',
    },
    {
      key: '2',
      firstName: 'Mohammad',
      lastName: 'Alvi Ridho',
      position: 'Human Resource',
      phone: '02123456789',
      email: 'alvi@mail.com',
    },
    {
      key: '3',
      firstName: 'Pardi',
      lastName: 'Master',
      position: 'CEO',
      phone: '0897767665365635',
      email: 'pardi@mail.com',
    },
    {
      key: '4',
      firstName: 'Bayu',
      lastName: 'Beta',
      position: 'Bayu Body Builder',
      phone: '08155565333',
      email: 'bayu@mail.com',
    },
    {
      key: '5',
      firstName: 'Muhammad',
      lastName: 'Abdurrahman',
      position: 'Designer',
      phone: '08183737634',
      email: 'omen@mail.com',
    },
    {
      key: '6',
      firstName: 'Muhammad',
      lastName: 'Omen',
      position: 'Designer 2',
      phone: '08188776763',
      email: 'mamen@mail.com',
    },
    {
      key: '7',
      firstName: 'Uswatun',
      lastName: 'Hasanah',
      position: 'Perawat',
      phone: '088774763334',
      email: 'uus@mail.com',
    },
  ]);

  const [count, setCount] = useState(8);
  const [error, setError] = useState<string>('');



  const handleDelete = (key: React.Key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: 'First Name',
      dataIndex: 'firstName',
      width: '30%',
      editable: true,
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      editable: true,
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Position',
      dataIndex: 'position',
      editable: true,
      sorter: (a, b) => a.position.localeCompare(b.position),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      editable: true,
      sorter: (a, b) => a.phone.localeCompare(b.phone),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Email',
      dataIndex: 'email',
      editable: true,
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
            <a>Delete</a>
          </Popconfirm>
        ) : null,
    },
  ];

  const handleAdd = () => {
    const newData: DataType = {
      key: count,
      firstName: '...',
      lastName: '...',
      position: '...',
      phone: '...',
      email: '...',
    };
    setDataSource([newData, ...dataSource]);
    setCount(count + 1);
  };

  const handleSave = (row: DataType) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        dataSource,
        handleSave,
      }),
    };
  });

  const paginationConfig = {
    pageSize: 5,
  };

  return (
    <>
      <div className='text-center mt-5 text-2xl font-bold text-purple-600'>
        Ambisius Frontend Test
      </div>
      <div>
        <Icon icon="carbon:add-filled" className="text-purple-600 float-right text-4xl cursor-pointer mt-2 mb-2 mr-2" onClick={handleAdd} />
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          columns={columns as ColumnTypes}
          pagination={paginationConfig}
        />
      </div>
    </>
  );
};

export default App;
