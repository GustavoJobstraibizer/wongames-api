import { Table } from '@buffetjs/core';
import { Header } from '@buffetjs/custom';
import React, { memo, useEffect, useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  padding: 18px 30px;

  p {
    margin-top: 1rem;
  }
`

const HomePage = () => {
  const [rows, setRows] = useState([]);

  const headers = [
    {
      name: 'Name',
      value: 'name',
    },
    {
      name: 'Description',
      value: 'description',
    },
    {
      name: 'Url',
      value: 'html_url',
    },
  ];

  useEffect(() => {
    const getRepos = async () => {
      try {
        const data = await (await fetch('https://api.github.com/users/React-avancado/repos')).json()
        setRows(data);
      } catch(e) {
        strapi.notification.error(`Ops... Github API access limit, exceeded! ${e}`);
      }
    }

    getRepos();
  }, []);

  return (
    <Wrapper>
      <Header
        title={{ label: 'Repositories' }}
        content="A list of our repositories in React Avançado course" />

      <Table headers={headers} rows={rows} />
    </Wrapper>
  );
};

export default memo(HomePage);
